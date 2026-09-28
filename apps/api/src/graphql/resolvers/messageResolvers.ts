import { GraphQLContext } from '../context.js';
import { AuthenticationError, NotFoundError, UserInputError } from '../errors.js';
import { memoryDb, MessageRow } from '../../db/memoryStore.js';
import { pubsub } from '../pubsub.js';
import { GRAPHQL_WS_EVENTS } from '@securechat/shared';
import { PushDispatcher } from '../../notifications/index.js';

export interface SendMessageArgs {
  input: {
    clientMutationId?: string | null;
    conversationId: string;
    recipientId?: string | null;
    encryptedPayload: {
      ciphertext: string;
      nonce: string;
      senderPublicKey: string;
      recipientPublicKey: string;
      version: number;
    };
  };
}

export interface UpdateMessageStatusArgs {
  input: {
    messageId: string;
    status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  };
}

export interface SetTypingArgs {
  input: {
    conversationId: string;
    isTyping: boolean;
  };
}

function formatMessage(msg: MessageRow) {
  return {
    id: msg.id,
    conversationId: msg.conversation_id,
    senderId: msg.sender_id,
    senderDeviceId: msg.sender_device_id,
    recipientId: msg.recipient_id,
    encryptedPayload: JSON.parse(msg.encrypted_payload),
    status: msg.status,
    createdAt: msg.created_at.toISOString(),
    deliveredAt: msg.delivered_at?.toISOString() || null,
    readAt: msg.read_at?.toISOString() || null,
  };
}

export const messageResolvers = {
  Query: {
    messages: (
      _parent: unknown,
      args: { conversationId: string; limit?: number; beforeCursor?: string },
      context: GraphQLContext,
    ) => {
      if (!context.currentUser) throw new AuthenticationError();

      const conv = memoryDb.conversations.get(args.conversationId);
      if (!conv) throw new NotFoundError('Conversation not found');

      const isParticipant = memoryDb
        .getParticipants(conv.id)
        .some(p => p.user_id === context.currentUser!.id);
      if (!isParticipant) throw new NotFoundError('Conversation not found');

      const { messages, hasMore } = memoryDb.getMessages(
        args.conversationId,
        args.limit || 50,
        args.beforeCursor,
      );

      const items = messages.map(formatMessage);
      const nextCursor = items.length > 0 ? items[items.length - 1].id : null;

      return {
        items,
        hasMore,
        nextCursor,
      };
    },
  },

  Mutation: {
    sendMessage: async (_parent: unknown, args: SendMessageArgs, context: GraphQLContext) => {
      if (!context.currentUser || !context.currentDevice) {
        throw new AuthenticationError();
      }

      const { conversationId, recipientId, encryptedPayload } = args.input;
      const conv = memoryDb.conversations.get(conversationId);
      if (!conv) throw new NotFoundError('Conversation not found');

      const isParticipant = memoryDb
        .getParticipants(conv.id)
        .some(p => p.user_id === context.currentUser!.id);
      if (!isParticipant) throw new NotFoundError('Conversation not found');

      if (!encryptedPayload.ciphertext || !encryptedPayload.nonce) {
        throw new UserInputError('Valid encrypted payload is required');
      }

      const msg = memoryDb.createMessage({
        conversation_id: conversationId,
        sender_id: context.currentUser.id,
        sender_device_id: context.currentDevice.device_id,
        recipient_id: recipientId || null,
        encrypted_payload: JSON.stringify(encryptedPayload),
        status: 'SENT',
      });

      const formatted = formatMessage(msg);

      // Publish to real-time subscribers
      await pubsub.publish(`${GRAPHQL_WS_EVENTS.MESSAGE_SENT}:${conversationId}`, {
        messageSent: formatted,
      });

      // Dispatch zero-plaintext push notification to other conversation participants
      try {
        const participants = memoryDb.getParticipants(conv.id);
        const otherParticipants = participants.filter(p => p.user_id !== context.currentUser!.id);
        const pushDispatcher = PushDispatcher.getInstance();

        for (const part of otherParticipants) {
          const recipientDevices = memoryDb.findDevicesByUserId(part.user_id);
          for (const dev of recipientDevices) {
            if (dev.push_token) {
              pushDispatcher
                .sendNewMessageNotification({
                  recipientPushToken: dev.push_token,
                  conversationId,
                  senderId: context.currentUser.id,
                  senderName: context.currentUser.display_name || context.currentUser.username,
                  messageId: formatted.id,
                })
                .catch(() => {});
            }
          }
        }
      } catch {
        // Notification dispatch failures should not fail message mutation
      }

      return formatted;
    },

    updateMessageStatus: async (
      _parent: unknown,
      args: UpdateMessageStatusArgs,
      context: GraphQLContext,
    ) => {
      if (!context.currentUser) throw new AuthenticationError();

      const { messageId, status } = args.input;
      const updated = memoryDb.updateMessageStatus(messageId, status);
      if (!updated) throw new NotFoundError('Message not found');

      const payload = {
        messageId: updated.id,
        conversationId: updated.conversation_id,
        status: updated.status,
        timestamp: new Date().toISOString(),
      };

      await pubsub.publish(
        `${GRAPHQL_WS_EVENTS.MESSAGE_STATUS_UPDATED}:${updated.conversation_id}`,
        {
          messageStatusUpdated: payload,
        },
      );

      return formatMessage(updated);
    },

    setTyping: async (_parent: unknown, args: SetTypingArgs, context: GraphQLContext) => {
      if (!context.currentUser) throw new AuthenticationError();

      const { conversationId, isTyping } = args.input;
      const payload = {
        conversationId,
        userId: context.currentUser.id,
        username: context.currentUser.username,
        isTyping,
      };

      await pubsub.publish(`${GRAPHQL_WS_EVENTS.USER_TYPING}:${conversationId}`, {
        userTyping: payload,
      });

      return true;
    },
  },

  Subscription: {
    messageSent: {
      subscribe: (_parent: unknown, args: { conversationId: string }, _context: GraphQLContext) => {
        return pubsub.asyncIterator(`${GRAPHQL_WS_EVENTS.MESSAGE_SENT}:${args.conversationId}`);
      },
    },

    messageStatusUpdated: {
      subscribe: (_parent: unknown, args: { conversationId: string }, _context: GraphQLContext) => {
        return pubsub.asyncIterator(
          `${GRAPHQL_WS_EVENTS.MESSAGE_STATUS_UPDATED}:${args.conversationId}`,
        );
      },
    },

    userTyping: {
      subscribe: (_parent: unknown, args: { conversationId: string }, _context: GraphQLContext) => {
        return pubsub.asyncIterator(`${GRAPHQL_WS_EVENTS.USER_TYPING}:${args.conversationId}`);
      },
    },
  },
};
