const { DeleteTableCommand } = require('@aws-sdk/client-dynamodb');
const { client,TABLE_NAME } = require('./db');
client.send(new DeleteTableCommand({TableName:TABLE_NAME})).then(()=>console.log('Tabela apagada. Execute npm run setup && npm run seed.')).catch(e=>{console.error(e);process.exitCode=1});
