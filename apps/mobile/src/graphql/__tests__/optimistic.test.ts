import {
  createOptimisticMessage,
  appendOptimisticMessage,
  updateMessageStatusInCache,
  replaceOptimisticMessageInCache,
} from '../optimistic';
import { createApolloCache } from '../cache';
import {
  GET_MESSAGES_QUERY,
  GetMessagesQuery,
  GetMessagesQueryVariables,
  MessageStatus,
} from '@securechat/shared';

describe('Optimistic Cache Updates', () => {
  it('creates an optimistic message with PENDING status and tempId', () => {
    const optimistic = createOptimisticMessage({
      tempId: 'temp_999',
      conversationId: 'conv_1',
      senderId: 'user_1',
      senderDeviceId: 'dev_1',
      encryptedPayload: {
        ciphertext: 'base64_cipher',
        nonce: 'base64_nonce',
        senderPublicKey: 'key_s',
        recipientPublicKey: 'key_r',
        version: 1,
      },
    });

    expect(optimistic.id).toBe('temp_999');
    expect(optimistic.status).toBe(MessageStatus.Pending);
    expect(optimistic.deliveredAt).toBeNull();
    expect(optimistic.readAt).toBeNull();
  });

  it('appends optimistic message and updates status in cache', () => {
    const cache = createApolloCache();
    cache.writeQuery<GetMessagesQuery, GetMessagesQueryVariables>({
      query: GET_MESSAGES_QUERY,
      variables: { conversationId: 'conv_1' },
      data: {
        messages: {
          __typename: 'MessageConnection',
          items: [
            {
              __typename: 'Message',
              id: 'msg_existing',
              conversationId: 'conv_1',
              senderId: 'user_2',
              senderDeviceId: 'dev_2',
              recipientId: 'user_1',
              status: MessageStatus.Delivered,
              createdAt: '2026-09-22T09:00:00Z',
              deliveredAt: '2026-09-22T09:01:00Z',
              readAt: null,
              encryptedPayload: {
                ciphertext: 'abc',
                nonce: '123',
                senderPublicKey: 'k1',
                recipientPublicKey: 'k2',
                version: 1,
              },
            },
          ],
          hasMore: false,
          nextCursor: null,
        },
      },
    });

    const optimistic = createOptimisticMessage({
      tempId: 'temp_999',
      conversationId: 'conv_1',
      senderId: 'user_1',
      senderDeviceId: 'dev_1',
      encryptedPayload: {
        ciphertext: 'xyz',
        nonce: '456',
        senderPublicKey: 'k1',
        recipientPublicKey: 'k2',
        version: 1,
      },
    });

    appendOptimisticMessage(cache, 'conv_1', optimistic);

    let readData = cache.readQuery<GetMessagesQuery, GetMessagesQueryVariables>({
      query: GET_MESSAGES_QUERY,
      variables: { conversationId: 'conv_1' },
    });

    expect(readData?.messages.items).toHaveLength(2);
    expect(readData?.messages.items[1]?.status).toBe(MessageStatus.Pending);

    // Update to FAILED on network error
    updateMessageStatusInCache(cache, 'conv_1', 'temp_999', MessageStatus.Failed);

    readData = cache.readQuery<GetMessagesQuery, GetMessagesQueryVariables>({
      query: GET_MESSAGES_QUERY,
      variables: { conversationId: 'conv_1' },
    });
    expect(readData?.messages.items[1]?.status).toBe(MessageStatus.Failed);

    // Replace with server response on successful delivery
    const serverMessage = {
      ...optimistic,
      id: 'server_msg_777',
      status: MessageStatus.Sent,
    };

    replaceOptimisticMessageInCache(cache, 'conv_1', 'temp_999', serverMessage);

    readData = cache.readQuery<GetMessagesQuery, GetMessagesQueryVariables>({
      query: GET_MESSAGES_QUERY,
      variables: { conversationId: 'conv_1' },
    });
    expect(readData?.messages.items[1]?.id).toBe('server_msg_777');
    expect(readData?.messages.items[1]?.status).toBe(MessageStatus.Sent);
  });
});
