import { ApolloLink, execute, gql, Observable } from '@apollo/client';
import { GraphQLError } from 'graphql';
import { createApolloCache } from '../cache';
import { createAuthLink, createErrorLink, createApolloClient, TokenProvider } from '../client';

const TEST_QUERY = gql`
  query TestQuery {
    me {
      id
      username
    }
  }
`;

describe('Apollo Cache TypePolicies', () => {
  it('deduplicates conversations by id during merge', () => {
    const cache = createApolloCache();
    cache.writeQuery({
      query: gql`
        query {
          conversations {
            id
            name
          }
        }
      `,
      data: {
        conversations: [
          { __typename: 'Conversation', id: 'c1', name: 'Chat 1' },
          { __typename: 'Conversation', id: 'c2', name: 'Chat 2' },
        ],
      },
    });

    // Write second page with an overlap
    cache.writeQuery({
      query: gql`
        query {
          conversations {
            id
            name
          }
        }
      `,
      data: {
        conversations: [
          { __typename: 'Conversation', id: 'c2', name: 'Chat 2 Updated' },
          { __typename: 'Conversation', id: 'c3', name: 'Chat 3' },
        ],
      },
    });

    const read = cache.readQuery<{ conversations: Array<{ id: string; name: string }> }>({
      query: gql`
        query {
          conversations {
            id
            name
          }
        }
      `,
    });

    expect(read?.conversations).toHaveLength(3);
    expect(read?.conversations.map(c => c.id)).toEqual(['c1', 'c2', 'c3']);
    expect(read?.conversations.find(c => c.id === 'c2')?.name).toBe('Chat 2 Updated');
  });

  it('merges messages cursor pages and deduplicates by id', () => {
    const cache = createApolloCache();
    const query = gql`
      query GetMessages($conversationId: ID!) {
        messages(conversationId: $conversationId) {
          items {
            id
            conversationId
            senderId
            senderDeviceId
            status
            createdAt
          }
          hasMore
          nextCursor
        }
      }
    `;

    cache.writeQuery({
      query,
      variables: { conversationId: 'c1' },
      data: {
        messages: {
          __typename: 'MessageConnection',
          items: [
            {
              __typename: 'Message',
              id: 'm1',
              conversationId: 'c1',
              senderId: 'u1',
              senderDeviceId: 'd1',
              status: 'SENT',
              createdAt: '2026-09-17T10:00:00Z',
            },
          ],
          hasMore: true,
          nextCursor: 'cursor_1',
        },
      },
    });

    cache.writeQuery({
      query,
      variables: { conversationId: 'c1' },
      data: {
        messages: {
          __typename: 'MessageConnection',
          items: [
            {
              __typename: 'Message',
              id: 'm1',
              conversationId: 'c1',
              senderId: 'u1',
              senderDeviceId: 'd1',
              status: 'READ',
              createdAt: '2026-09-17T10:00:00Z',
            },
            {
              __typename: 'Message',
              id: 'm2',
              conversationId: 'c1',
              senderId: 'u2',
              senderDeviceId: 'd2',
              status: 'SENT',
              createdAt: '2026-09-17T10:01:00Z',
            },
          ],
          hasMore: false,
          nextCursor: null,
        },
      },
    });

    const read = cache.readQuery<{
      messages: { items: Array<{ id: string; status: string }>; hasMore: boolean };
    }>({
      query,
      variables: { conversationId: 'c1' },
    });

    expect(read?.messages.items).toHaveLength(2);
    expect(read?.messages.items[0]?.status).toBe('READ');
    expect(read?.messages.hasMore).toBe(false);
  });
});

describe('Apollo Links', () => {
  it('AuthLink injects Bearer token into headers', done => {
    const mockTokenProvider: TokenProvider = {
      getAccessToken: jest.fn().mockResolvedValue('test_access_token_123'),
      getRefreshToken: jest.fn().mockResolvedValue('test_refresh_token_123'),
      refreshTokens: jest.fn().mockResolvedValue('new_token'),
      onAuthFailure: jest.fn().mockResolvedValue(undefined),
    };

    const authLink = createAuthLink(mockTokenProvider);
    const mockTerminatingLink = new ApolloLink(operation => {
      const headers = operation.getContext().headers;
      expect(headers.authorization).toBe('Bearer test_access_token_123');
      return Observable.of({ data: { me: { id: 'u1', username: 'alice' } } });
    });

    const link = ApolloLink.from([authLink, mockTerminatingLink]);

    execute(link, { query: TEST_QUERY }).subscribe({
      next: result => {
        expect(result.data?.me.username).toBe('alice');
      },
      complete: () => {
        expect(mockTokenProvider.getAccessToken).toHaveBeenCalledTimes(1);
        done();
      },
    });
  });

  it('ErrorLink performs silent token refresh on UNAUTHENTICATED error and retries', done => {
    let callCount = 0;
    const mockTokenProvider: TokenProvider = {
      getAccessToken: jest.fn().mockResolvedValue('expired_token'),
      getRefreshToken: jest.fn().mockResolvedValue('valid_refresh_token'),
      refreshTokens: jest.fn().mockResolvedValue('refreshed_access_token'),
      onAuthFailure: jest.fn().mockResolvedValue(undefined),
    };

    const errorLink = createErrorLink(mockTokenProvider);
    const mockTerminatingLink = new ApolloLink(operation => {
      callCount++;
      if (callCount === 1) {
        // First attempt returns UNAUTHENTICATED
        return Observable.of({
          errors: [
            {
              message: 'Context creation failed: Invalid or expired token',
              extensions: { code: 'UNAUTHENTICATED' },
            } as unknown as GraphQLError,
          ],
        });
      }

      // Second attempt succeeds with new token
      const headers = operation.getContext().headers;
      expect(headers.authorization).toBe('Bearer refreshed_access_token');
      return Observable.of({
        data: { me: { id: 'u1', username: 'alice' } },
      });
    });

    const link = ApolloLink.from([errorLink, mockTerminatingLink]);

    execute(link, { query: TEST_QUERY }).subscribe({
      next: result => {
        expect(result.data?.me.username).toBe('alice');
      },
      complete: () => {
        expect(callCount).toBe(2);
        expect(mockTokenProvider.refreshTokens).toHaveBeenCalledTimes(1);
        expect(mockTokenProvider.onAuthFailure).not.toHaveBeenCalled();
        done();
      },
    });
  });

  it('ErrorLink calls onAuthFailure when token refresh fails', done => {
    const mockTokenProvider: TokenProvider = {
      getAccessToken: jest.fn().mockResolvedValue('expired_token'),
      getRefreshToken: jest.fn().mockResolvedValue('invalid_refresh_token'),
      refreshTokens: jest.fn().mockRejectedValue(new Error('Refresh failed')),
      onAuthFailure: jest.fn().mockResolvedValue(undefined),
    };

    const errorLink = createErrorLink(mockTokenProvider);
    const mockTerminatingLink = new ApolloLink(() => {
      return Observable.of({
        errors: [
          {
            message: 'Context creation failed: Invalid or expired token',
            extensions: { code: 'UNAUTHENTICATED' },
          } as unknown as GraphQLError,
        ],
      });
    });

    const link = ApolloLink.from([errorLink, mockTerminatingLink]);

    execute(link, { query: TEST_QUERY }).subscribe({
      error: () => {
        expect(mockTokenProvider.onAuthFailure).toHaveBeenCalledTimes(1);
        done();
      },
      complete: () => {
        // In case observer emits complete instead of error
        expect(mockTokenProvider.onAuthFailure).toHaveBeenCalledTimes(1);
        done();
      },
    });
  });

  it('createApolloClient instantiates with proper cache and config', () => {
    const client = createApolloClient({
      apiUrl: 'http://localhost:4000/graphql',
    });

    expect(client).toBeDefined();
    expect(client.cache).toBeDefined();
  });
});
