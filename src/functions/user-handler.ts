import { APIGatewayProxyEventV2, APIGatewayProxyResult } from 'aws-lambda';
import { ok } from 'assert';
import { queryUsers } from '../helpers/dynamodb';

export type GetUsersEvent = Pick<APIGatewayProxyEventV2, 'queryStringParameters'>;

export const getUsers = async (event: GetUsersEvent): Promise<APIGatewayProxyResult> => {
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
