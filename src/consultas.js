const { buscarMeta, consultarCarrinho, consultarProduto } = require('./service');
async function main() {
  const id = '001';
  const carrinho = await consultarCarrinho(id);
  if (!carrinho.meta) throw new Error('Primeiro execute: npm run seed');
  console.log('\nCONSULTA 1 - Quem é o dono e quando expira o carrinho 001?');
  console.log(JSON.stringify(await buscarMeta(id), null, 2));
  console.log('\nCONSULTA 2 - Quais produtos estão no carrinho 001?');
  console.table(carrinho.itens.map(({sku,nome,quantidade,preco})=>({sku,nome,quantidade,preco})));
  const sku = carrinho.itens[0].sku;
  console.log(`\nCONSULTA 3 - Qual é o produto ${sku} do carrinho 001?`);
  console.log(JSON.stringify(await consultarProduto(id,sku),null,2));
  console.log('\nCONSULTA 4 - Qual a quantidade de cada item no carrinho 001?');
  console.table(carrinho.itens.map(x=>({sku:x.sku,quantidade:x.quantidade})));
  console.log('\nCONSULTA 5 - Qual o valor total do carrinho 001?');
  console.log(`R$ ${carrinho.total.toFixed(2)} (calculado em JavaScript após Query por PK)`);
  console.log('\nTTL - Valor Unix em segundos:',carrinho.meta.expiresAt, '(não apaga no DynamoDB Local)');
}
main().catch(e=>{console.error(e);process.exitCode=1;});
