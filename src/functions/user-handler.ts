import { APIGatewayProxyEventV2, APIGatewayProxyHandler } from 'aws-lambda';
import { ok } from 'assert';
import { queryUsers } from '../helpers/dynamodb';

type GetUsersEvent = Pick<APIGatewayProxyEventV2, 'headers' | 'queryStringParameters'>;

export const getUsers: APIGatewayProxyHandler = async (event: GetUsersEvent) => {
  const name = event.queryStringParameters?.['name'];

  try {
    ok(name, 'name is required');

    const users = await queryUsers(name);
    return { statusCode: 200, body: JSON.stringify(users) };
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: err.message }),
    };
  }
};
