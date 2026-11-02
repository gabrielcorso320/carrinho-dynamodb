-- Modelo relacional equivalente (sintaxe SQL genérica, próxima a SQLite).
CREATE TABLE carrinhos (
  id VARCHAR(20) PRIMARY KEY,
  cliente VARCHAR(100) NOT NULL,
  criado_em TIMESTAMP NOT NULL,
  expira_em TIMESTAMP NOT NULL
);
CREATE TABLE produtos (
  sku VARCHAR(20) PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  preco DECIMAL(10,2) NOT NULL
);
CREATE TABLE itens_carrinho (
  carrinho_id VARCHAR(20) NOT NULL,
  produto_sku VARCHAR(20) NOT NULL,
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  PRIMARY KEY (carrinho_id, produto_sku),
  FOREIGN KEY (carrinho_id) REFERENCES carrinhos(id),
  FOREIGN KEY (produto_sku) REFERENCES produtos(sku)
);

-- Consulta 2 equivalente: produtos do carrinho 001
SELECT p.sku, p.nome, ic.quantidade, p.preco
FROM itens_carrinho ic JOIN produtos p ON p.sku = ic.produto_sku
WHERE ic.carrinho_id = '001';

-- Consulta 5 equivalente: total do carrinho 001
SELECT COALESCE(SUM(ic.quantidade * p.preco), 0) AS total
FROM itens_carrinho ic JOIN produtos p ON p.sku = ic.produto_sku
WHERE ic.carrinho_id = '001';
