import { Request } from 'express';
import { JwtService } from '../auth/jwt.js';
import { memoryDb, UserRow, DeviceRow } from '../db/memoryStore.js';

export interface GraphQLContext {
  currentUser: UserRow | null;
  currentDevice: DeviceRow | null;
  req?: Request;
}

export function createContextFromHeader(authHeader?: string): GraphQLContext {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { currentUser: null, currentDevice: null };
  }

  const token = authHeader.substring(7).trim();
  try {
    const payload = JwtService.verifyAccessToken(token);
    const user = memoryDb.findUserById(payload.userId) || null;
    const device = memoryDb.findDevice(payload.userId, payload.deviceId) || null;
    return {
      currentUser: user,
      currentDevice: device,
    };
  } catch {
    return { currentUser: null, currentDevice: null };
  }
}

export async function buildContext({ req }: { req?: Request }): Promise<GraphQLContext> {
  const authHeader = req?.headers.authorization;
  const ctx = createContextFromHeader(authHeader);
  return {
    ...ctx,
    req,
  };
}
