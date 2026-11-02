const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient } = require('@aws-sdk/lib-dynamodb');
const { TABLE_NAME = 'CarrinhoCompras', DYNAMODB_ENDPOINT = 'http://localhost:8000' } = process.env;
const client = new DynamoDBClient({
  region: 'us-east-1', endpoint: DYNAMODB_ENDPOINT,
  credentials: { accessKeyId: 'local', secretAccessKey: 'local' }
});
const db = DynamoDBDocumentClient.from(client, { marshallOptions: { removeUndefinedValues: true } });
module.exports = { client, db, TABLE_NAME };
