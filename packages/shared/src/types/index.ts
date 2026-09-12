export type MessageStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';

export type DevicePlatform = 'ANDROID' | 'IOS' | 'WEB';

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

export interface EncryptedPayload {
  ciphertext: string; // Base64
  nonce: string; // Base64 (24 bytes)
  senderPublicKey: string; // Base64 (32 bytes)
  recipientPublicKey: string; // Base64 (32 bytes)
  version: number;
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
