const { criarCarrinho, adicionarProduto, consultarCarrinho, atualizarQuantidade, removerProduto } = require('./service');
async function main() {
 const id='DEMO';
 try { await criarCarrinho(id,'Cliente Demonstração'); } catch(e) { if(e.name!=='ConditionalCheckFailedException') throw e; }
 await adicionarProduto(id,{sku:'P100',nome:'Fone de ouvido',preco:120,quantidade:1});
 await adicionarProduto(id,{sku:'P200',nome:'Cabo USB-C',preco:30,quantidade:2});
 console.log('\n1 INSERIR + 2 CONSULTAR:', JSON.stringify(await consultarCarrinho(id),null,2));
 await atualizarQuantidade(id,'P100',3);
 console.log('\n3 ATUALIZAR:', JSON.stringify(await consultarCarrinho(id),null,2));
 await removerProduto(id,'P200');
 console.log('\n4 EXCLUIR:', JSON.stringify(await consultarCarrinho(id),null,2));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
