import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const region = 'ap-southeast-2';
let client = process.env.IS_OFFLINE
  ? new DynamoDBClient({ region, endpoint: 'http://localhost:8000' })
  : new DynamoDBClient({ region });

const ddbDocClient = DynamoDBDocumentClient.from(client);

export const addConnection = async (email: string, connectionId: string) => {
  const putCommand = new PutCommand({
    TableName: process.env.USER_TABLE,
    Item: { pk: email, sk: connectionId },
    ConditionExpression: 'attribute_not_exists(pk)',
  });

  await ddbDocClient.send(putCommand);
};
