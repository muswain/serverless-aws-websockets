import {
  ApiGatewayManagementApi,
  PostToConnectionCommand,
  PostToConnectionRequest,
} from '@aws-sdk/client-apigatewaymanagementapi';
import { APIGatewayEvent } from 'aws-lambda';
import { addConnection, getConnections, removeConnection } from '../helpers/dynamodb';

const apig = process.env.IS_OFFLINE
  ? new ApiGatewayManagementApi({ endpoint: 'http://localhost:3001' })
  : new ApiGatewayManagementApi({ endpoint: process.env.APIG_ENDPOINT });

export const connectionManager = async (event: WsConnectionEvent) => {
  const {
    requestContext: { connectionId, routeKey },
  } = event;

  console.info('event received: ', connectionId, routeKey, event);
  let connRequest: PostToConnectionRequest;

  switch (routeKey) {
    case '$connect':
      await addConnection(connectionId);

      connRequest = {
        ConnectionId: connectionId,
        Data: Buffer.from(JSON.stringify({ message: `connection ${connectionId} established` })),
      };

      await apig.send(new PostToConnectionCommand(connRequest));
      break;

    case '$disconnect':
      await removeConnection(connectionId);

      connRequest = {
        ConnectionId: connectionId,
        Data: Buffer.from(JSON.stringify({ message: `connection ${connectionId} disconnected` })),
      };

      await apig.send(new PostToConnectionCommand(connRequest));
      break;

    case '$broadcast':
      const connectionIds = await getConnections();
      console.info('connectionsIds: ', connectionIds);

      const request: WsRequest = JSON.parse(event.body);
      for (const connectionId of connectionIds) {
        try {
          const connRequest = {
            ConnectionId: connectionId,
            Data: Buffer.from(JSON.stringify({ message: `Broadcasting: ${request.message}` })),
          };
          await apig.send(new PostToConnectionCommand(connRequest));
        } catch (err) {
          console.error('connection broadcast error', err.message);

          if (err.statusCode === 410) {
            console.info(`Found stale connection, deleting ${connectionId}`);
            await removeConnection(connectionId);
          }
        }
      }

      break;
    default:
      break;
  }

  // $default handler
  return {
    statusCode: 200,
  };
};

type WsConnectionEvent = Pick<APIGatewayEvent, 'headers' | 'body' | 'requestContext'>;
