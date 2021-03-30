import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const region = 'ap-southeast-2';
let client = process.env.IS_OFFLINE
  ? new DynamoDBClient({ region, endpoint: 'http://localhost:8000' })
  : new DynamoDBClient({ region });

const ddbDocClient = DynamoDBDocumentClient.from(client);

export const queryUsers = async (name: string): Promise<User[] | []> => {
  console.info(process.env.IS_OFFLINE, region);
  const queryCommand = new QueryCommand({
    TableName: process.env.USER_TABLE,
    IndexName: 'sk-name',
    KeyConditionExpression: 'sk = :pk AND begins_with(#user, :name)',
    ExpressionAttributeNames: {
      '#user': 'name',
    },
    ExpressionAttributeValues: {
      ':pk': 'profile',
      ':name': name,
    },
  });

  const { Items } = await ddbDocClient.send(queryCommand);
  console.info(Items);
  const users: User[] = Items.map((item) => {
    const { name, city, country, pk: email } = item;
    return { name, city, country, email };
  });

  return users;
};
