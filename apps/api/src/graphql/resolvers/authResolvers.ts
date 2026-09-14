import { PasswordService } from '../../auth/password.js';
import { SessionService } from '../../auth/session.js';
import { memoryDb } from '../../db/memoryStore.js';
import { AuthenticationError, UserInputError } from '../errors.js';
import { GraphQLContext } from '../context.js';

export interface RegisterArgs {
  input: {
    username: string;
    email: string;
    password: string;
    displayName: string;
    deviceId: string;
    deviceName: string;
    platform: 'ANDROID' | 'IOS' | 'WEB';
    publicKey: string;
  };
}

export interface LoginArgs {
  input: {
    identifier: string;
    password: string;
    deviceId: string;
    deviceName: string;
    platform: 'ANDROID' | 'IOS' | 'WEB';
    publicKey: string;
  };
}

export interface RefreshTokenArgs {
  input: {
    refreshToken: string;
  };
}

export const authResolvers = {
  Mutation: {
    register: async (_parent: unknown, args: RegisterArgs) => {
      const { username, email, password, displayName, deviceId, deviceName, platform, publicKey } =
        args.input;

      if (!username || username.trim().length < 3) {
        throw new UserInputError('Username must be at least 3 characters long');
      }
      if (!email || !email.includes('@')) {
        throw new UserInputError('A valid email address is required');
      }
      if (!password || password.length < 8) {
        throw new UserInputError('Password must be at least 8 characters long');
      }
      if (!publicKey) {
        throw new UserInputError('Device public key is required for E2EE');
      }

      const passwordHash = await PasswordService.hash(password);
      const user = memoryDb.createUser({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password_hash: passwordHash,
        display_name: displayName.trim(),
      });

      const device = memoryDb.registerDevice({
        user_id: user.id,
        device_id: deviceId,
        device_name: deviceName,
        platform,
        public_key: publicKey,
      });

      const tokens = SessionService.issueTokens(user.id, device.device_id);

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.display_name,
          avatarUrl: user.avatar_url,
          createdAt: user.created_at.toISOString(),
          updatedAt: user.updated_at.toISOString(),
        },
        device: {
          id: device.id,
          deviceId: device.device_id,
          deviceName: device.device_name,
          platform: device.platform,
          publicKey: device.public_key,
          lastActiveAt: device.last_active_at.toISOString(),
          createdAt: device.created_at.toISOString(),
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      };
    },

    login: async (_parent: unknown, args: LoginArgs) => {
      const { identifier, password, deviceId, deviceName, platform, publicKey } = args.input;

      const user = memoryDb.findUserByUsernameOrEmail(identifier);
      if (!user) {
        throw new AuthenticationError('Invalid username/email or password');
      }

      const isValidPassword = await PasswordService.verify(user.password_hash, password);
      if (!isValidPassword) {
        throw new AuthenticationError('Invalid username/email or password');
      }

      const device = memoryDb.registerDevice({
        user_id: user.id,
        device_id: deviceId,
        device_name: deviceName,
        platform,
        public_key: publicKey,
      });

      const tokens = SessionService.issueTokens(user.id, device.device_id);

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.display_name,
          avatarUrl: user.avatar_url,
          createdAt: user.created_at.toISOString(),
          updatedAt: user.updated_at.toISOString(),
        },
        device: {
          id: device.id,
          deviceId: device.device_id,
          deviceName: device.device_name,
          platform: device.platform,
          publicKey: device.public_key,
          lastActiveAt: device.last_active_at.toISOString(),
          createdAt: device.created_at.toISOString(),
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      };
    },

    refreshToken: async (_parent: unknown, args: RefreshTokenArgs) => {
      const tokens = SessionService.rotateRefreshToken(args.input.refreshToken);
      const { JwtService } = await import('../../auth/jwt.js');
      const decodedPayload = JwtService.verifyAccessToken(tokens.accessToken);
      const user = memoryDb.findUserById(decodedPayload.userId);
      const device = memoryDb.findDevice(decodedPayload.userId, decodedPayload.deviceId);

      if (!user || !device) {
        throw new AuthenticationError('User or device not found');
      }

      return {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.display_name,
          avatarUrl: user.avatar_url,
          createdAt: user.created_at.toISOString(),
          updatedAt: user.updated_at.toISOString(),
        },
        device: {
          id: device.id,
          deviceId: device.device_id,
          deviceName: device.device_name,
          platform: device.platform,
          publicKey: device.public_key,
          lastActiveAt: device.last_active_at.toISOString(),
          createdAt: device.created_at.toISOString(),
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresIn: tokens.expiresIn,
      };
    },

    logout: async (_parent: unknown, _args: unknown, context: GraphQLContext) => {
      if (!context.currentUser || !context.currentDevice) {
        return false;
      }
      SessionService.revokeSession(context.currentUser.id, context.currentDevice.device_id);
      return true;
    },
  },
};
