import { ApolloClient, ApolloLink, HttpLink, Observable, from, split } from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { setContext } from '@apollo/client/link/context';
import { RetryLink } from '@apollo/client/link/retry';
import { getMainDefinition } from '@apollo/client/utilities';
import { Platform } from 'react-native';
import { createApolloCache } from './cache';
import { createWsLink, getDefaultWsUrl, WsConnectionHandle } from './wsClient';

export interface TokenProvider {
  getAccessToken(): Promise<string | null>;
  getRefreshToken(): Promise<string | null>;
  refreshTokens(): Promise<string | null>;
  onAuthFailure(): Promise<void>;
}

export interface ClientConfig {
  apiUrl?: string;
  wsUrl?: string;
  tokenProvider?: TokenProvider;
  customLinks?: ApolloLink[];
  enableSubscriptions?: boolean;
}

export function getDefaultApiUrl(): string {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:4000/graphql';
  }
  return 'http://localhost:4000/graphql';
}

export function createAuthLink(tokenProvider: TokenProvider): ApolloLink {
  return setContext(async (_, { headers }) => {
    try {
      const token = await tokenProvider.getAccessToken();
      if (!token) {
        return { headers: { ...headers } };
      }
      return {
        headers: {
          ...headers,
          authorization: `Bearer ${token}`,
        },
      };
    } catch {
      return { headers: { ...headers } };
    }
  });
}

export function createErrorLink(tokenProvider: TokenProvider): ApolloLink {
  let activeRefreshPromise: Promise<string | null> | null = null;

  async function refreshTokenOnce(): Promise<string | null> {
    if (!activeRefreshPromise) {
      activeRefreshPromise = tokenProvider
        .refreshTokens()
        .catch(async () => {
          await tokenProvider.onAuthFailure();
          return null;
        })
        .finally(() => {
          activeRefreshPromise = null;
        });
    }
    return activeRefreshPromise;
  }

  return onError(({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        const isAuthError =
          err.extensions?.code === 'UNAUTHENTICATED' ||
          err.message.includes('UNAUTHENTICATED') ||
          err.message.includes('401');

        if (isAuthError) {
          return new Observable(observer => {
            refreshTokenOnce()
              .then(newToken => {
                if (!newToken) {
                  observer.error(err);
                  return;
                }

                // Retry original operation with new Bearer token
                const oldHeaders = operation.getContext().headers || {};
                operation.setContext({
                  headers: {
                    ...oldHeaders,
                    authorization: `Bearer ${newToken}`,
                  },
                });

                const subscriber = {
                  next: observer.next.bind(observer),
                  error: observer.error.bind(observer),
                  complete: observer.complete.bind(observer),
                };

                forward(operation).subscribe(subscriber);
              })
              .catch(refreshError => {
                observer.error(refreshError);
              });
          });
        }
      }
    }

    if (networkError) {
      // Network error pass-through handled by RetryLink
    }

    return undefined;
  });
}

export function createRetryLink(): RetryLink {
  return new RetryLink({
    delay: {
      initial: 500,
      max: 3000,
      jitter: true,
    },
    attempts: {
      max: 3,
      retryIf: error => !!error && !error.message?.includes('UNAUTHENTICATED'),
    },
  });
}

export interface ClientWithSubscriptions {
  client: ApolloClient<unknown>;
  wsHandle?: WsConnectionHandle;
}

export function createApolloClient(config: ClientConfig = {}): ApolloClient<unknown> {
  const apiUrl = config.apiUrl || getDefaultApiUrl();
  const wsUrl = config.wsUrl || getDefaultWsUrl();
  const cache = createApolloCache();
  const httpLink = new HttpLink({ uri: apiUrl });

  const httpLinks: ApolloLink[] = [];

  if (config.tokenProvider) {
    const errorLink = createErrorLink(config.tokenProvider);
    const authLink = createAuthLink(config.tokenProvider);
    const retryLink = createRetryLink();
    httpLinks.push(errorLink, authLink, retryLink);
  }

  if (config.customLinks) {
    httpLinks.push(...config.customLinks);
  }

  httpLinks.push(httpLink);
  const httpChain = from(httpLinks);

  let finalLink: ApolloLink = httpChain;

  // Split link for WebSocket subscriptions if enabled (default true)
  if (config.enableSubscriptions !== false) {
    const wsHandle = createWsLink({
      wsUrl,
      tokenProvider: config.tokenProvider,
    });

    finalLink = split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
      },
      wsHandle.wsLink,
      httpChain,
    );
  }

  return new ApolloClient({
    link: finalLink,
    cache,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: 'cache-and-network',
        nextFetchPolicy: 'cache-first',
      },
      query: {
        fetchPolicy: 'network-only',
        errorPolicy: 'all',
      },
      mutate: {
        errorPolicy: 'all',
      },
    },
  });
}
