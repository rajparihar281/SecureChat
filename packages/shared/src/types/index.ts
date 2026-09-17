import type { MessageStatus, DevicePlatform } from '../graphql/schema-types.js';

export interface UserSummary {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  createdAt: string;
}

export interface DeviceInfo {
  id: string;
  userId: string;
  deviceId: string;
  deviceName: string;
  platform: DevicePlatform;
  pushToken?: string | null;
  publicKey: string;
  lastActiveAt: string;
}

export interface ConversationSummary {
  id: string;
  isGroup: boolean;
  name?: string | null;
  participants: UserSummary[];
  lastMessage?: {
    id: string;
    senderId: string;
    encryptedContent: string;
    status: MessageStatus;
    createdAt: string;
  } | null;
  unreadCount: number;
  updatedAt: string;
}
