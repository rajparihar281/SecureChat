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
  merge(existing, incoming, { readField }) {
    if (!existing) {
      return incoming;
    }
    if (!incoming) {
      return existing;
    }

    const mergedItemsMap = new Map<string, CacheItem>();

    // Add existing items
    for (const item of existing.items || []) {
      const id = readField<string>('id', item);
      if (id) {
        mergedItemsMap.set(id, item);
      }
    }

    // Merge incoming items, replacing matching IDs
    for (const item of incoming.items || []) {
      const id = readField<string>('id', item);
      if (id) {
        mergedItemsMap.set(id, item);
      }
    }

    const items = Array.from(mergedItemsMap.values());

    return {
      items,
      hasMore: incoming.hasMore !== undefined ? incoming.hasMore : existing.hasMore,
      nextCursor: incoming.nextCursor !== undefined ? incoming.nextCursor : existing.nextCursor,
    };
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
