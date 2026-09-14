import { authResolvers } from './authResolvers.js';
import { userResolvers } from './userResolvers.js';
import { conversationResolvers } from './conversationResolvers.js';
import { messageResolvers } from './messageResolvers.js';
import { cryptoResolvers } from './cryptoResolvers.js';

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...conversationResolvers.Query,
    ...messageResolvers.Query,
    ...cryptoResolvers.Query,
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...conversationResolvers.Mutation,
    ...messageResolvers.Mutation,
    ...cryptoResolvers.Mutation,
  },
  Subscription: {
    ...messageResolvers.Subscription,
  },
};
