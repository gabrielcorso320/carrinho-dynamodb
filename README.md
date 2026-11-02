# Carrinho de Compras com DynamoDB

Projeto acadêmico de banco de dados NoSQL do grupo **Chave-Valor**. Implementa um carrinho de compras em **Node.js** com **DynamoDB Local**, usando uma tabela única e consultas por chave.

> A demonstração é executada no terminal. Não há interface web implementada; as telas dos slides são ilustrativas.

## Índice

- [Visão geral](#visão-geral)
- [Como executar](#como-executar)
- [Comandos disponíveis](#comandos-disponíveis)
- [Modelagem dos dados](#modelagem-dos-dados)
- [Consultas e resultados](#consultas-e-resultados)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Configuração](#configuração)
- [Limitações](#limitações)
- [Solução de problemas](#solução-de-problemas)
- [Material complementar](#material-complementar)

## Visão geral

O projeto demonstra como organizar metadados e produtos de um carrinho sob a mesma chave de partição. Permite criar carrinhos, adicionar e consultar produtos, atualizar quantidades, remover itens e calcular o total.

As cinco consultas da atividade usam `GetItem` e `Query`, sem `Scan` da tabela inteira. O repositório também inclui um modelo SQL equivalente, documentação e apresentação.

| Tecnologia | Uso |
| --- | --- |
| Node.js 20 ou superior | Execução dos scripts JavaScript |
| AWS SDK for JavaScript v3 | Acesso ao DynamoDB |
| DynamoDB Local | Banco de dados da demonstração |
| Docker e Docker Compose | Execução local do banco |
| SQL | Comparação com o modelo relacional |

## Como executar

Tenha **Node.js com npm**, **Git** e **Docker com Compose** instalados. No Windows, mantenha o Docker Desktop em execução.

### 1. Obter o projeto e instalar as dependências

```bash
git clone https://github.com/gabrielcorso320/carrinho-dynamodb.git
cd carrinho-dynamodb
npm install
```

Se você baixou o projeto como ZIP, extraia os arquivos, abra o terminal na pasta que contém `package.json` e comece por `npm install`.

### 2. Iniciar o banco

```bash
docker compose up -d
docker compose ps
```

O DynamoDB Local usa a porta **8000**. Aguarde a inicialização do serviço antes de criar a tabela. Para acompanhar a inicialização:

```bash
docker compose logs dynamodb-local
```

### 3. Criar a tabela e carregar os exemplos

```bash
npm run setup
npm run seed
```

Em uma tabela vazia, a carga cria **10 carrinhos**, com **3 produtos por carrinho**: **40 registros**, sendo 10 metadados e 30 itens de produto.

### 4. Executar as consultas e a demonstração

```bash
npm run consultas
npm run demo
```

O primeiro comando responde às cinco perguntas sobre o carrinho `001`. O segundo utiliza um carrinho separado, chamado `DEMO`, para mostrar inclusão, consulta, atualização e exclusão de produtos.

### Encerrar o ambiente

```bash
docker compose down
```

Os dados permanecem no volume Docker. Para apagar também os dados locais, use `docker compose down -v`.

## Comandos disponíveis

| Comando | O que faz |
| --- | --- |
| `npm run setup` | Cria a tabela e solicita a configuração de TTL em `expiresAt` |
| `npm run seed` | Insere os carrinhos e produtos de exemplo |
| `npm run consultas` | Executa as cinco consultas sobre o carrinho `001` |
| `npm run demo` | Demonstra as operações CRUD no carrinho `DEMO` |
| `npm run reset` | **Apaga a tabela configurada e todos os seus registros** |

Após um reset, execute novamente `npm run setup` e `npm run seed`.

## Modelagem dos dados

A tabela padrão é `CarrinhoCompras`, com uma chave composta por `PK` e `SK`:

| PK — chave de partição | SK — chave de ordenação | Conteúdo |
| --- | --- | --- |
| `CART#001` | `META` | Cliente, data de criação e expiração |
| `CART#001` | `ITEM#P001` | Produto, preço, quantidade e expiração |
| `CART#001` | `ITEM#P002` | Produto, preço, quantidade e expiração |
| `CART#001` | `ITEM#P003` | Produto, preço, quantidade e expiração |

- **`PK`** agrupa os registros de cada carrinho.
- **`SK`** distingue os metadados (`META`) dos produtos (`ITEM#<sku>`).
- **`expiresAt`** armazena o prazo de expiração em segundos Unix; o prazo padrão é de sete dias.
- Nome e preço são copiados para o item do carrinho, sem depender de um catálogo separado.

O serviço consulta os registros pela `PK`, separa metadados e produtos e calcula `preco × quantidade` no JavaScript. Veja os detalhes em [Modelagem dos dados](docs/modelagem.md).

## Consultas e resultados

| Pergunta | Implementação |
| --- | --- |
| Quem é o dono do carrinho e quando ele expira? | `GetItem` com `PK` e `SK = META` |
| Quais produtos estão no carrinho? | `Query` por `PK`, seguida de seleção dos registros `ITEM#` |
| Qual é um produto específico? | `GetItem` com `PK` e `SK = ITEM#<sku>` |
| Qual é a quantidade de cada produto? | Seleção dos campos dos itens já consultados |
| Qual é o valor total do carrinho? | Soma de `preco × quantidade` no JavaScript |

Após a carga inicial, o carrinho `001` contém:

| Produto | Quantidade | Preço unitário | Subtotal |
| --- | ---: | ---: | ---: |
| Mouse sem fio | 2 | R$ 79,90 | R$ 159,80 |
| Teclado mecânico | 3 | R$ 229,90 | R$ 689,70 |
| Mousepad grande | 1 | R$ 49,90 | R$ 49,90 |
| **Total** | | | **R$ 899,40** |

Esses valores são os resultados esperados a partir de `src/seed.js`, e não uma captura de execução. A demonstração `DEMO` tem totais esperados de **R$ 180,00**, **R$ 420,00** e **R$ 360,00**, respectivamente após a inclusão, a atualização e a exclusão, quando não há outros produtos nesse carrinho.

## Estrutura do projeto

```text
carrinho-dynamodb/
├── README.md
├── .gitignore
├── docker-compose.yml
├── package.json
├── src/
│   ├── db.js           # Cliente e configuração do DynamoDB
│   ├── setup.js        # Criação da tabela e configuração de TTL
│   ├── seed.js         # Carga dos dados de exemplo
│   ├── service.js      # Operações do carrinho
│   ├── consultas.js    # Cinco consultas da atividade
│   ├── demo.js         # Demonstração de CRUD
│   └── reset.js        # Exclusão da tabela
├── docs/
│   ├── modelagem.md
│   └── comparativo.md
├── sql/
│   └── modelo_relacional.sql
└── slides/
    └── apresentacao_carrinho_dynamodb.pptx
```

## Configuração

O arquivo `src/db.js` lê as seguintes variáveis de ambiente:

| Variável | Padrão |
| --- | --- |
| `TABLE_NAME` | `CarrinhoCompras` |
| `DYNAMODB_ENDPOINT` | `http://localhost:8000` |

A região está definida como `us-east-1`, com credenciais fictícias `local`. Na configuração padrão, o projeto se conecta ao banco local e não requer uma conta AWS.

As variáveis devem ser definidas no terminal antes de executar os scripts. O projeto **não carrega arquivos `.env` automaticamente**. Se alterar o nome da tabela, use a mesma configuração em todos os comandos.

## Limitações

- **TTL local:** o DynamoDB Local não remove automaticamente registros expirados. O atributo é armazenado e a configuração é solicitada pelo script; a remoção automática por TTL é um comportamento do serviço hospedado na AWS. Os scripts também não ocultam registros expirados.
- **Carga repetida:** `seed` sobrescreve os produtos de exemplo com as mesmas chaves e preserva metadados existentes. Ele não remove produtos adicionais nem o carrinho `DEMO`; por isso, 40 registros é a contagem da carga em uma tabela vazia.
- **Escopo:** trata-se de uma demonstração acadêmica em terminal, sem interface web, API HTTP ou autenticação de usuários.
- **Consultas:** a implementação não percorre páginas adicionais de resultados; foi preparada para os pequenos carrinhos de exemplo.
- **Evidências:** as telas da apresentação são ilustrativas. Para documentar uma execução real, capture seu terminal após os comandos e salve as imagens em `docs/prints/`.

## Solução de problemas

| Sintoma | Verificação |
| --- | --- |
| Erro de conexão ou `ECONNREFUSED` | Confira se o Docker está aberto e execute `docker compose ps` e `docker compose logs dynamodb-local` |
| Porta `8000` ocupada | Encerre o serviço conflitante ou ajuste a porta publicada no Compose e o `DYNAMODB_ENDPOINT` no terminal |
| Tabela não encontrada | Execute `npm run setup` com o mesmo endpoint e nome de tabela usados pelos outros scripts |
| Carrinho `001` não encontrado | Execute `npm run seed` após criar a tabela |
| Contagem diferente de 40 registros | Verifique se já executou `demo` ou adicionou outros itens; a carga não limpa a tabela |
| Itens continuam presentes após a expiração | Esse comportamento é esperado no DynamoDB Local |

## Material complementar

- [Modelagem e padrões de acesso](docs/modelagem.md)
- [Comparativo: DynamoDB e banco relacional](docs/comparativo.md)
- [Modelo relacional e consultas SQL equivalentes](sql/modelo_relacional.sql)
- [Apresentação em PowerPoint](slides/apresentacao_carrinho_dynamodb.pptx)

Projeto acadêmico do grupo **Chave-Valor**.
