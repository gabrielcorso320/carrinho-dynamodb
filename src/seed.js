const { criarCarrinho, adicionarProduto } = require('./service');
const produtos = [
  ['P001','Mouse sem fio',79.90], ['P002','Teclado mecânico',229.90],
  ['P003','Mousepad grande',49.90], ['P004','Headset USB',159.90],
  ['P005','Webcam Full HD',189.90], ['P006','Suporte notebook',69.90],
  ['P007','Hub USB-C',99.90], ['P008','SSD externo 500GB',349.90],
  ['P009','Cabo HDMI 2m',34.90], ['P010','Luminária LED',89.90]
];
async function main() {
  for (let c = 1; c <= 10; c++) {
    const id = String(c).padStart(3,'0');
    try { await criarCarrinho(id, `Cliente ${id}`); } catch(e) { if (e.name !== 'ConditionalCheckFailedException') throw e; }
    for (let i = 0; i < 3; i++) {
      const p = produtos[(c + i - 1) % produtos.length];
      await adicionarProduto(id, { sku:p[0], nome:p[1], preco:p[2], quantidade:1 + ((c+i)%3) });
    }
  }
  console.log('Carga concluída: 10 carrinhos (META) + 30 itens de produto = 40 registros.');
  console.log('Execute: npm run consultas');
}
main().catch(e => { console.error(e); process.exitCode = 1; });
