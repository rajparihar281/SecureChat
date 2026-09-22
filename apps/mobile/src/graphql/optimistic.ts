import { ApolloCache } from '@apollo/client';
import {
  GET_MESSAGES_QUERY,
  GetMessagesQuery,
  GetMessagesQueryVariables,
  MessageFieldsFragment,
  MessageStatus,
  EncryptedPayloadInput,
} from '@securechat/shared';

export interface OptimisticMessageParams {
  tempId: string;
  conversationId: string;
  senderId: string;
  senderDeviceId: string;
  recipientId?: string | null;
  encryptedPayload: EncryptedPayloadInput;
}

export function createOptimisticMessage(params: OptimisticMessageParams): MessageFieldsFragment {
  return {
    id: params.tempId,
    conversationId: params.conversationId,
    senderId: params.senderId,
    senderDeviceId: params.senderDeviceId,
    recipientId: params.recipientId ?? null,
    status: MessageStatus.Pending,
    createdAt: new Date().toISOString(),
    deliveredAt: null,
    readAt: null,
    encryptedPayload: {
      ciphertext: params.encryptedPayload.ciphertext,
      nonce: params.encryptedPayload.nonce,
      senderPublicKey: params.encryptedPayload.senderPublicKey,
      recipientPublicKey: params.encryptedPayload.recipientPublicKey,
      version: params.encryptedPayload.version,
    },
  };
}

export function appendOptimisticMessage(
  cache: ApolloCache<unknown>,
  conversationId: string,
  optimisticMessage: MessageFieldsFragment,
): void {
  try {
    const existing = cache.readQuery<GetMessagesQuery, GetMessagesQueryVariables>({
      query: GET_MESSAGES_QUERY,
      variables: { conversationId },
    });

    if (existing?.messages) {
      cache.writeQuery<GetMessagesQuery, GetMessagesQueryVariables>({
        query: GET_MESSAGES_QUERY,
        variables: { conversationId },
        data: {
          messages: {
            ...existing.messages,
            items: [...existing.messages.items, optimisticMessage],
          },
        },
      });
    }
  } catch {
    // If not in cache yet, Apollo will populate upon first query
  }
}

export function updateMessageStatusInCache(
  cache: ApolloCache<unknown>,
  conversationId: string,
  messageId: string,
  newStatus: MessageStatus,
): void {
  try {
    const existing = cache.readQuery<GetMessagesQuery, GetMessagesQueryVariables>({
      query: GET_MESSAGES_QUERY,
      variables: { conversationId },
    });

    if (existing?.messages) {
      const updatedItems = existing.messages.items.map(m =>
        m.id === messageId ? { ...m, status: newStatus } : m,
      );

      cache.writeQuery<GetMessagesQuery, GetMessagesQueryVariables>({
        query: GET_MESSAGES_QUERY,
        variables: { conversationId },
        data: {
          messages: {
            ...existing.messages,
            items: updatedItems,
          },
        },
      });
    }
  } catch {
    // Ignored
  }
}

export function replaceOptimisticMessageInCache(
  cache: ApolloCache<unknown>,
  conversationId: string,
  tempId: string,
  serverMessage: MessageFieldsFragment,
): void {
  try {
    const existing = cache.readQuery<GetMessagesQuery, GetMessagesQueryVariables>({
      query: GET_MESSAGES_QUERY,
      variables: { conversationId },
    });

    if (existing?.messages) {
      const updatedItems = existing.messages.items.map(m => (m.id === tempId ? serverMessage : m));

      cache.writeQuery<GetMessagesQuery, GetMessagesQueryVariables>({
        query: GET_MESSAGES_QUERY,
        variables: { conversationId },
        data: {
          messages: {
            ...existing.messages,
            items: updatedItems,
          },
        },
      });
    }
  } catch {
    // Ignored
  }
}
