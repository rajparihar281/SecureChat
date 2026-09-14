import { GraphQLContext } from '../context.js';
import { AuthenticationError, UserInputError } from '../errors.js';
import { memoryDb } from '../../db/memoryStore.js';

export interface UploadDeviceKeysArgs {
  input: {
    identityKey: string;
    preKeys: Array<{ keyId: number; publicKey: string }>;
  };
}

export const cryptoResolvers = {
  Query: {
    deviceKeys: (_parent: unknown, args: { userId: string }, context: GraphQLContext) => {
      if (!context.currentUser) throw new AuthenticationError();

      const devices = memoryDb.findDevicesByUserId(args.userId);
      return devices.map(d => {
        const prekeys = memoryDb.getPreKeys(d.id);
        const latestPrekey = prekeys.length > 0 ? prekeys[0].public_key : null;
        return {
          deviceId: d.device_id,
          deviceName: d.device_name,
          publicKey: d.public_key,
          preKey: latestPrekey,
        };
      });
    },
  },

  Mutation: {
    uploadDeviceKeys: (_parent: unknown, args: UploadDeviceKeysArgs, context: GraphQLContext) => {
      if (!context.currentUser || !context.currentDevice) {
        throw new AuthenticationError();
      }

      const { identityKey, preKeys } = args.input;
      if (!identityKey) {
        throw new UserInputError('Identity key is required');
      }

      context.currentDevice.public_key = identityKey;

      if (preKeys && preKeys.length > 0) {
        memoryDb.addPreKeys(
          context.currentDevice.id,
          preKeys.map(k => ({ key_id: k.keyId, public_key: k.publicKey })),
        );
      }

      return true;
    },

    registerPushToken: (
      _parent: unknown,
      args: { input: { pushToken: string } },
      context: GraphQLContext,
    ) => {
      if (!context.currentUser || !context.currentDevice) {
        throw new AuthenticationError();
      }

      context.currentDevice.push_token = args.input.pushToken;
      return true;
    },
  },
};
