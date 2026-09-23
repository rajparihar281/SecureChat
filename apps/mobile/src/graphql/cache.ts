import { InMemoryCache, FieldPolicy, StoreObject, Reference } from '@apollo/client';

export type CacheItem = StoreObject | Reference;

export interface MessageConnectionCache {
  items: Array<CacheItem>;
  hasMore: boolean;
  nextCursor?: string | null;
}

const conversationsFieldPolicy: FieldPolicy = {
  keyArgs: false,
  merge(existing: Array<CacheItem> = [], incoming: Array<CacheItem> = [], { readField }) {
    const existingById = new Map<string, CacheItem>();
    for (const item of existing) {
      const id = readField<string>('id', item);
      if (id) {
        existingById.set(id, item);
      }
    }

    for (const item of incoming) {
      const id = readField<string>('id', item);
      if (id) {
        existingById.set(id, item);
      }
    }

    return Array.from(existingById.values());
  },
};

const messagesFieldPolicy: FieldPolicy<MessageConnectionCache> = {
  keyArgs: ['conversationId'],
  merge(existing, incoming, { args, readField }) {
    if (!existing) {
      return incoming;
    }
    if (!incoming) {
      return existing;
    }

    // Only merge pages when paginating with beforeCursor
    if (args?.beforeCursor) {
      const mergedItemsMap = new Map<string, CacheItem>();

      for (const item of existing.items || []) {
        const id = readField<string>('id', item);
        if (id) {
          mergedItemsMap.set(id, item);
        }
      }

      for (const item of incoming.items || []) {
        const id = readField<string>('id', item);
        if (id) {
          mergedItemsMap.set(id, item);
        }
      }

      return {
        items: Array.from(mergedItemsMap.values()),
        hasMore: incoming.hasMore !== undefined ? incoming.hasMore : existing.hasMore,
        nextCursor: incoming.nextCursor !== undefined ? incoming.nextCursor : existing.nextCursor,
      };
    }

    // Otherwise, replace with incoming full/updated collection
    return incoming;
  },
};

export function createApolloCache(): InMemoryCache {
  return new InMemoryCache({
    typePolicies: {
      User: {
        keyFields: ['id'],
      },
      Device: {
        keyFields: ['id'],
      },
      Conversation: {
        keyFields: ['id'],
      },
      Message: {
        keyFields: ['id'],
      },
      Query: {
        fields: {
          conversations: conversationsFieldPolicy,
          messages: messagesFieldPolicy,
        },
      },
    },
  });
}
