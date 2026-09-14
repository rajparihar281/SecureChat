import { GraphQLContext } from '../context.js';
import { AuthenticationError, NotFoundError, UserInputError } from '../errors.js';
import { memoryDb, ConversationRow } from '../../db/memoryStore.js';

export interface CreateConversationArgs {
  input: {
    participantIds: string[];
    name?: string | null;
    isGroup?: boolean | null;
  };
}

function formatConversation(conv: ConversationRow, currentUserId: string) {
  const participants = memoryDb.getParticipants(conv.id).map(p => {
    const user = memoryDb.findUserById(p.user_id);
    return {
      id: p.user_id,
      username: user?.username || 'unknown',
      email: user?.email || '',
      displayName: user?.display_name || 'User',
      avatarUrl: user?.avatar_url || null,
      createdAt: user?.created_at.toISOString() || new Date().toISOString(),
      updatedAt: user?.updated_at.toISOString() || new Date().toISOString(),
    };
  });

  const { messages } = memoryDb.getMessages(conv.id, 1);
  const lastMsg = messages[0];

  let unreadCount = 0;
  const allMessages = memoryDb.getMessages(conv.id, 100).messages;
  for (const m of allMessages) {
    if (m.sender_id !== currentUserId && m.status !== 'READ') {
      unreadCount++;
    }
  }

  return {
    id: conv.id,
    isGroup: conv.is_group,
    name: conv.name,
    createdBy: conv.created_by,
    participants,
    lastMessage: lastMsg
      ? {
          id: lastMsg.id,
          conversationId: lastMsg.conversation_id,
          senderId: lastMsg.sender_id,
          senderDeviceId: lastMsg.sender_device_id,
          recipientId: lastMsg.recipient_id,
          encryptedPayload: JSON.parse(lastMsg.encrypted_payload),
          status: lastMsg.status,
          createdAt: lastMsg.created_at.toISOString(),
          deliveredAt: lastMsg.delivered_at?.toISOString() || null,
          readAt: lastMsg.read_at?.toISOString() || null,
        }
      : null,
    unreadCount,
    createdAt: conv.created_at.toISOString(),
    updatedAt: conv.updated_at.toISOString(),
  };
}

export const conversationResolvers = {
  Query: {
    conversation: (_parent: unknown, args: { id: string }, context: GraphQLContext) => {
      if (!context.currentUser) throw new AuthenticationError();

      const conv = memoryDb.conversations.get(args.id);
      if (!conv) throw new NotFoundError('Conversation not found');

      const isParticipant = memoryDb
        .getParticipants(conv.id)
        .some(p => p.user_id === context.currentUser!.id);
      if (!isParticipant) throw new NotFoundError('Conversation not found');

      return formatConversation(conv, context.currentUser.id);
    },

    conversations: (
      _parent: unknown,
      args: { limit?: number; offset?: number },
      context: GraphQLContext,
    ) => {
      if (!context.currentUser) throw new AuthenticationError();

      const userConvs = memoryDb.getConversationsForUser(context.currentUser.id);
      const limit = args.limit || 50;
      const offset = args.offset || 0;
      const paged = userConvs.slice(offset, offset + limit);

      return paged.map(c => formatConversation(c, context.currentUser!.id));
    },
  },

  Mutation: {
    createConversation: (
      _parent: unknown,
      args: CreateConversationArgs,
      context: GraphQLContext,
    ) => {
      if (!context.currentUser) throw new AuthenticationError();

      const { participantIds, name, isGroup } = args.input;
      if (!participantIds || participantIds.length === 0) {
        throw new UserInputError('At least one participant is required');
      }

      // Check if 1-on-1 conversation already exists
      if (!isGroup && participantIds.length === 1) {
        const targetUserId = participantIds[0];
        const existingConvs = memoryDb.getConversationsForUser(context.currentUser.id);
        for (const ec of existingConvs) {
          if (!ec.is_group) {
            const parts = memoryDb.getParticipants(ec.id);
            if (parts.some(p => p.user_id === targetUserId)) {
              return formatConversation(ec, context.currentUser.id);
            }
          }
        }
      }

      const conv = memoryDb.createConversation({
        is_group: !!isGroup,
        name: name || null,
        created_by: context.currentUser.id,
        participant_ids: participantIds,
      });

      return formatConversation(conv, context.currentUser.id);
    },
  },
};
