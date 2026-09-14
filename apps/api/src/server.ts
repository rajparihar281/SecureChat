import express from 'express';
import http from 'http';
import cors from 'cors';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { WebSocketServer } from 'ws';
import { useServer } from 'graphql-ws/lib/use/ws';
import { typeDefs } from './graphql/typeDefs.js';
import { resolvers } from './graphql/resolvers/index.js';
import { formatError } from './graphql/errors.js';
import { createContextFromHeader, GraphQLContext } from './graphql/context.js';
import { config } from './config/index.js';

export interface ServerInstance {
  app: express.Express;
  httpServer: http.Server;
  apolloServer: ApolloServer<GraphQLContext>;
}

export async function createServer(): Promise<ServerInstance> {
  const app = express();
  const httpServer = http.createServer(app);

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  // 1. WebSocket Server for real-time GraphQL subscriptions
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: '/graphql',
  });

  const serverCleanup = useServer(
    {
      schema,
      context: async ctx => {
        const connectionParams = ctx.connectionParams as { authorization?: string } | undefined;
        const authHeader = connectionParams?.authorization;
        return createContextFromHeader(authHeader);
      },
    },
    wsServer,
  );

  // 2. Apollo Server 4 for HTTP Queries & Mutations
  const apolloServer = new ApolloServer<GraphQLContext>({
    schema,
    formatError,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await apolloServer.start();

  app.use(cors());
  app.use(express.json());

  const graphqlMiddleware = expressMiddleware(apolloServer, {
    context: async ({ req }) => createContextFromHeader(req.headers.authorization),
  });

  app.use('/graphql', graphqlMiddleware as unknown as express.RequestHandler);

  app.get('/health', (_req, res) => {
    res.json({
      status: 'healthy',
      app: 'SecureChat API',
      timestamp: new Date().toISOString(),
    });
  });

  return { app, httpServer, apolloServer };
}

export async function startServer(): Promise<http.Server> {
  const { httpServer } = await createServer();
  httpServer.listen(config.port, () => {
    console.info(`SecureChat GraphQL API running at http://localhost:${config.port}/graphql`);
    console.info(`SecureChat WebSocket Subscriptions at ws://localhost:${config.port}/graphql`);
  });
  return httpServer;
}
