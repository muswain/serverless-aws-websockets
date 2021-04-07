import { ApiGatewayManagementApi, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi';
import { addConnection, getConnections, removeConnection } from '../helpers/dynamodb';

const apig = process.env.IS_OFFLINE
  ? new ApiGatewayManagementApi({ endpoint: 'http://localhost:3001' })
  : new ApiGatewayManagementApi({ endpoint: process.env.APIG_ENDPOINT });

export const connectionManager = async (event: any) => {
  const {
    requestContext: { connectionId, routeKey },
  } = event;

  console.info('event received: ', connectionId, routeKey);

  switch (routeKey) {
    case '$connect':
      await addConnection(connectionId);
      await apig.send(
        new PostToConnectionCommand({
          ConnectionId: connectionId,
          Data: Buffer.from(
            JSON.stringify({
              message: `connection ${connectionId} established`,
            })
          ),
        })
      );

      break;

    case '$disconnect':
      await removeConnection(connectionId);
      await apig.send(
        new PostToConnectionCommand({
          ConnectionId: connectionId,
          Data: Buffer.from(
            JSON.stringify({
              message: `connection ${connectionId} disconnected`,
            })
          ),
        })
      );

      break;

    case '$broadcast':
      const connectionIds = await getConnections();
      console.info('connectionsIds: ', connectionIds);
      for (const connectionId of connectionIds) {
        await apig.send(
          new PostToConnectionCommand({
            ConnectionId: connectionId,
            Data: Buffer.from(
              JSON.stringify({
                message: `hello ${connectionId}`,
              })
            ),
          })
        );
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
