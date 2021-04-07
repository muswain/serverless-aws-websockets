import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DeleteCommand, DynamoDBDocumentClient, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const region = 'ap-southeast-2';
let client = process.env.IS_OFFLINE
  ? new DynamoDBClient({ region, endpoint: 'http://localhost:8000' })
  : new DynamoDBClient({ region });

const ddbDocClient = DynamoDBDocumentClient.from(client);

export const addConnection = async (connectionId: string) => {
  const putCommand = new PutCommand({
    TableName: process.env.CONNECTIONS_TABLE,
    Item: { pk: connectionId, sk: connectionId },
    ConditionExpression: 'attribute_not_exists(pk)',
  });

  await ddbDocClient.send(putCommand);
};

export const removeConnection = async (connectionId: string) => {
  const deleteCommand = new DeleteCommand({
    TableName: process.env.CONNECTIONS_TABLE,
    Key: { pk: connectionId, sk: connectionId },
  });

  await ddbDocClient.send(deleteCommand);
};

export const getConnections = async (): Promise<string[]> => {
  const scanCommand = new ScanCommand({
    TableName: process.env.CONNECTIONS_TABLE,
  });

  const { Items: items } = await ddbDocClient.send(scanCommand);
  const connectionIds: string[] = items.map((item) => item['pk']);
  return connectionIds;
};
