const { CreateTableCommand, DescribeTableCommand, UpdateTimeToLiveCommand } = require('@aws-sdk/client-dynamodb');
const { client, TABLE_NAME } = require('./db');
async function main() {
  try {
    await client.send(new CreateTableCommand({
      TableName: TABLE_NAME, BillingMode: 'PAY_PER_REQUEST',
      AttributeDefinitions: [{ AttributeName: 'PK', AttributeType: 'S' }, { AttributeName: 'SK', AttributeType: 'S' }],
      KeySchema: [{ AttributeName: 'PK', KeyType: 'HASH' }, { AttributeName: 'SK', KeyType: 'RANGE' }]
    }));
    console.log(`Tabela ${TABLE_NAME} criada.`);
  } catch (e) {
    if (e.name !== 'ResourceInUseException') throw e;
    console.log(`Tabela ${TABLE_NAME} já existe.`);
  }
  await client.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
  try {
    await client.send(new UpdateTimeToLiveCommand({ TableName: TABLE_NAME, TimeToLiveSpecification: { AttributeName: 'expiresAt', Enabled: true } }));
    console.log('Configuração TTL expiresAt solicitada.');
  } catch (e) {
    console.log(`TTL: ${e.name}: ${e.message}`);
  }
  console.log('OBS: DynamoDB Local NÃO elimina itens automaticamente via TTL.');
}
main().catch(e => { console.error(e); process.exitCode = 1; });
