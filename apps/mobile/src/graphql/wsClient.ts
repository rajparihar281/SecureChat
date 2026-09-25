import { ApolloLink } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient, Client as WsClient } from 'graphql-ws';
import { AppState, AppStateStatus, Platform } from 'react-native';
import { TokenProvider } from './client';

export interface WsClientConfig {
  wsUrl?: string;
  tokenProvider?: TokenProvider;
  lazy?: boolean;
}

export function getDefaultWsUrl(): string {
  if (Platform.OS === 'android') {
    return 'ws://10.0.2.2:4000/graphql';
  }
  return 'ws://localhost:4000/graphql';
}

export interface WsConnectionHandle {
  wsClient: WsClient;
  wsLink: ApolloLink;
  destroy: () => void;
  getIsConnected: () => boolean;
}

export function createWsLink(config: WsClientConfig = {}): WsConnectionHandle {
  const wsUrl = config.wsUrl || getDefaultWsUrl();
  let isConnected = false;
  let isPaused = false;

  const wsClient = createClient({
    url: wsUrl,
    lazy: config.lazy ?? true,
    retryAttempts: 5,
    shouldRetry: () => !isPaused,
    connectionParams: async () => {
      try {
        const token = await config.tokenProvider?.getAccessToken();
        if (!token) return {};
        return {
          authorization: `Bearer ${token}`,
        };
      } catch {
        return {};
      }
    },
    on: {
      connected: () => {
        isConnected = true;
      },
      closed: () => {
        isConnected = false;
      },
      error: () => {
        isConnected = false;
      },
    },
  });

  const wsLink = new GraphQLWsLink(wsClient);

  // AppState connection lifecycle management
  const appStateSubscription = AppState.addEventListener(
    'change',
    (nextAppState: AppStateStatus) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // Pause and terminate socket in background to save battery and data
        isPaused = true;
        try {
          wsClient.dispose();
        } catch {
          // Ignored
        }
      } else if (nextAppState === 'active') {
        // Resume connection in foreground
        isPaused = false;
      }
    },
  );

  return {
    wsClient,
    wsLink,
    destroy: () => {
      appStateSubscription.remove();
      try {
        wsClient.dispose();
      } catch {
        // Ignored
      }
    },
    getIsConnected: () => isConnected,
  };
}
