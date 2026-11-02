const { PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { db, TABLE_NAME } = require('./db');
const pk = id => `CART#${id}`;
const itemKey = sku => `ITEM#${sku}`;
const round = n => Math.round((n + Number.EPSILON) * 100) / 100;
async function criarCarrinho(id, cliente, dias = 7) {
  const now = new Date();
  const expiresAt = Math.floor(now.getTime() / 1000) + dias * 86400;
  await db.send(new PutCommand({ TableName: TABLE_NAME,
    Item: { PK: pk(id), SK: 'META', carrinhoId: id, cliente, criadoEm: now.toISOString(), expiresAt },
    ConditionExpression: 'attribute_not_exists(PK) AND attribute_not_exists(SK)' }));
  return { id, cliente, expiresAt };
}
async function buscarMeta(id) {
  const r = await db.send(new GetCommand({ TableName: TABLE_NAME, Key: { PK: pk(id), SK: 'META' } }));
  return r.Item || null;
}
async function adicionarProduto(id, produto) {
  const meta = await buscarMeta(id);
  if (!meta) throw new Error(`Carrinho ${id} inexistente.`);
  if (!Number.isInteger(produto.quantidade) || produto.quantidade < 1 || !Number.isFinite(produto.preco) || produto.preco < 0) throw new Error('Quantidade/preço inválido.');
  await db.send(new PutCommand({ TableName: TABLE_NAME, Item: {
    PK: pk(id), SK: itemKey(produto.sku), sku: produto.sku, nome: produto.nome,
    quantidade: produto.quantidade, preco: produto.preco, expiresAt: meta.expiresAt
  } }));
}
async function consultarCarrinho(id) {
  // Query por chave de partição; sem Scan de tabela inteira.
  const res = await db.send(new QueryCommand({ TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk', ExpressionAttributeValues: { ':pk': pk(id) } }));
  const linhas = res.Items || [];
  const meta = linhas.find(x => x.SK === 'META') || null;
  const itens = linhas.filter(x => x.SK.startsWith('ITEM#'));
  return { meta, itens, total: round(itens.reduce((s,x) => s + x.preco * x.quantidade, 0)) };
}
async function consultarProduto(id, sku) {
  const res = await db.send(new GetCommand({ TableName: TABLE_NAME, Key: { PK: pk(id), SK: itemKey(sku) } }));
  return res.Item || null;
}
async function atualizarQuantidade(id, sku, quantidade) {
  if (!Number.isInteger(quantidade) || quantidade < 1) throw new Error('Quantidade deve ser inteira e positiva.');
  await db.send(new UpdateCommand({ TableName: TABLE_NAME,
    Key: { PK: pk(id), SK: itemKey(sku) }, UpdateExpression: 'SET quantidade = :q',
    ConditionExpression: 'attribute_exists(PK) AND attribute_exists(SK)',
    ExpressionAttributeValues: { ':q': quantidade } }));
}
async function removerProduto(id, sku) {
  await db.send(new DeleteCommand({ TableName: TABLE_NAME, Key: { PK: pk(id), SK: itemKey(sku) } }));
}
module.exports = { criarCarrinho, buscarMeta, adicionarProduto, consultarCarrinho, consultarProduto, atualizarQuantidade, removerProduto };
