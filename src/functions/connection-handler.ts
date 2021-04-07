import { APIGatewayEvent } from 'aws-lambda';
import { ApiGatewayManagementApi, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
import { addConnection } from '../helpers/dynamodb';

const apig = process.env.IS_OFFLINE
  ? new ApiGatewayManagementApi({ endpoint: 'http://localhost:3001' })
  : new ApiGatewayManagementApi({ endpoint: process.env.APIG_ENDPOINT });

export const connectionManager = async (event: APIGatewayEvent) => {
  const {
    requestContext: { connectionId, routeKey },
  } = event;

  console.info(connectionId);
  if (routeKey === '$connect') {
    // handle new connection

    await addConnection('a', connectionId);
    await apig.send(
      new PostToConnectionCommand({
        ConnectionId: connectionId,
        Data: Buffer.from('hello'),
      })
    );

    return {
      statusCode: 200,
    };
  }

  if (routeKey === '$disconnect') {
    // handle disconnection
    return {
      statusCode: 200,
    };
  }

  // $default handler
  return {
    statusCode: 200,
  };
};
