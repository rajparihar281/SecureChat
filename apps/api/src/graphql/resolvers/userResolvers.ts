import { GraphQLContext } from '../context.js';
import { AuthenticationError } from '../errors.js';
import { memoryDb } from '../../db/memoryStore.js';

export const userResolvers = {
  Query: {
    me: (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      if (!context.currentUser) {
        throw new AuthenticationError();
      }
      return {
        id: context.currentUser.id,
        username: context.currentUser.username,
        email: context.currentUser.email,
        displayName: context.currentUser.display_name,
        avatarUrl: context.currentUser.avatar_url,
        createdAt: context.currentUser.created_at.toISOString(),
        updatedAt: context.currentUser.updated_at.toISOString(),
      };
    },

    users: (_parent: unknown, args: { query?: string }, context: GraphQLContext) => {
      if (!context.currentUser) {
        throw new AuthenticationError();
      }
      const q = (args.query || '').trim().toLowerCase();
      const allUsers = Array.from(memoryDb.users.values()).filter(
        u => u.id !== context.currentUser!.id,
      );

      if (!q) {
        return allUsers.map(u => ({
          id: u.id,
          username: u.username,
          email: u.email,
          displayName: u.display_name,
          avatarUrl: u.avatar_url,
          createdAt: u.created_at.toISOString(),
          updatedAt: u.updated_at.toISOString(),
        }));
      }

      return allUsers
        .filter(
          u =>
            u.username.toLowerCase().includes(q) ||
            u.display_name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q),
        )
        .map(u => ({
          id: u.id,
          username: u.username,
          email: u.email,
          displayName: u.display_name,
          avatarUrl: u.avatar_url,
          createdAt: u.created_at.toISOString(),
          updatedAt: u.updated_at.toISOString(),
        }));
    },
  },
};
