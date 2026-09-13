import { v4 as uuidv4 } from 'uuid';

export interface UserRow {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  display_name: string;
  avatar_url: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface DeviceRow {
  id: string;
  user_id: string;
  device_id: string;
  device_name: string;
  platform: 'ANDROID' | 'IOS' | 'WEB';
  push_token: string | null;
  public_key: string;
  refresh_token_hash: string | null;
  last_active_at: Date;
  created_at: Date;
}

export interface ConversationRow {
  id: string;
  is_group: boolean;
  name: string | null;
  created_by: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ParticipantRow {
  conversation_id: string;
  user_id: string;
  joined_at: Date;
  last_read_message_id: string | null;
}

export interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_device_id: string;
  recipient_id: string | null;
  encrypted_payload: string; // JSON string
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  created_at: Date;
  delivered_at: Date | null;
  read_at: Date | null;
}

export interface PreKeyRow {
  id: string;
  device_id: string;
  key_id: number;
  public_key: string;
  created_at: Date;
}

export class MemoryDatabase {
  users: Map<string, UserRow> = new Map();
  devices: Map<string, DeviceRow> = new Map();
  conversations: Map<string, ConversationRow> = new Map();
  participants: ParticipantRow[] = [];
  messages: Map<string, MessageRow> = new Map();
  prekeys: Map<string, PreKeyRow> = new Map();

  clear(): void {
    this.users.clear();
    this.devices.clear();
    this.conversations.clear();
    this.participants = [];
    this.messages.clear();
    this.prekeys.clear();
  }

  createUser(data: {
    username: string;
    email: string;
    password_hash: string;
    display_name: string;
    avatar_url?: string | null;
  }): UserRow {
    const existingUsername = Array.from(this.users.values()).find(
      u => u.username.toLowerCase() === data.username.toLowerCase(),
    );
    if (existingUsername) {
      throw new Error(`User with username '${data.username}' already exists`);
    }
    const existingEmail = Array.from(this.users.values()).find(
      u => u.email.toLowerCase() === data.email.toLowerCase(),
    );
    if (existingEmail) {
      throw new Error(`User with email '${data.email}' already exists`);
    }

    const id = uuidv4();
    const now = new Date();
    const user: UserRow = {
      id,
      username: data.username,
      email: data.email,
      password_hash: data.password_hash,
      display_name: data.display_name,
      avatar_url: data.avatar_url || null,
      created_at: now,
      updated_at: now,
    };
    this.users.set(id, user);
    return user;
  }

  findUserById(id: string): UserRow | undefined {
    return this.users.get(id);
  }

  findUserByUsernameOrEmail(identifier: string): UserRow | undefined {
    const term = identifier.toLowerCase();
    return Array.from(this.users.values()).find(
      u => u.username.toLowerCase() === term || u.email.toLowerCase() === term,
    );
  }

  registerDevice(data: {
    user_id: string;
    device_id: string;
    device_name: string;
    platform: 'ANDROID' | 'IOS' | 'WEB';
    public_key: string;
    push_token?: string | null;
  }): DeviceRow {
    const existing = Array.from(this.devices.values()).find(
      d => d.user_id === data.user_id && d.device_id === data.device_id,
    );
    const now = new Date();
    if (existing) {
      existing.device_name = data.device_name;
      existing.platform = data.platform;
      existing.public_key = data.public_key;
      existing.last_active_at = now;
      if (data.push_token !== undefined) existing.push_token = data.push_token;
      return existing;
    }

    const id = uuidv4();
    const device: DeviceRow = {
      id,
      user_id: data.user_id,
      device_id: data.device_id,
      device_name: data.device_name,
      platform: data.platform,
      push_token: data.push_token || null,
      public_key: data.public_key,
      refresh_token_hash: null,
      last_active_at: now,
      created_at: now,
    };
    this.devices.set(id, device);
    return device;
  }

  setDeviceRefreshToken(userId: string, deviceId: string, tokenHash: string | null): void {
    const device = Array.from(this.devices.values()).find(
      d => d.user_id === userId && d.device_id === deviceId,
    );
    if (device) {
      device.refresh_token_hash = tokenHash;
      device.last_active_at = new Date();
    }
  }

  findDevice(userId: string, deviceId: string): DeviceRow | undefined {
    return Array.from(this.devices.values()).find(
      d => d.user_id === userId && d.device_id === deviceId,
    );
  }

  findDevicesByUserId(userId: string): DeviceRow[] {
    return Array.from(this.devices.values()).filter(d => d.user_id === userId);
  }

  createConversation(data: {
    is_group: boolean;
    name?: string | null;
    created_by: string;
    participant_ids: string[];
  }): ConversationRow {
    const id = uuidv4();
    const now = new Date();
    const conv: ConversationRow = {
      id,
      is_group: data.is_group,
      name: data.name || null,
      created_by: data.created_by,
      created_at: now,
      updated_at: now,
    };
    this.conversations.set(id, conv);

    const allParticipants = Array.from(new Set([data.created_by, ...data.participant_ids]));
    for (const pId of allParticipants) {
      this.participants.push({
        conversation_id: id,
        user_id: pId,
        joined_at: now,
        last_read_message_id: null,
      });
    }
    return conv;
  }

  getConversationsForUser(userId: string): ConversationRow[] {
    const convIds = new Set(
      this.participants.filter(p => p.user_id === userId).map(p => p.conversation_id),
    );
    return Array.from(this.conversations.values())
      .filter(c => convIds.has(c.id))
      .sort((a, b) => b.updated_at.getTime() - a.updated_at.getTime());
  }

  getParticipants(conversationId: string): ParticipantRow[] {
    return this.participants.filter(p => p.conversation_id === conversationId);
  }

  createMessage(data: {
    conversation_id: string;
    sender_id: string;
    sender_device_id: string;
    recipient_id?: string | null;
    encrypted_payload: string;
    status?: 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  }): MessageRow {
    const id = uuidv4();
    const now = new Date();
    const msg: MessageRow = {
      id,
      conversation_id: data.conversation_id,
      sender_id: data.sender_id,
      sender_device_id: data.sender_device_id,
      recipient_id: data.recipient_id || null,
      encrypted_payload: data.encrypted_payload,
      status: data.status || 'SENT',
      created_at: now,
      delivered_at: null,
      read_at: null,
    };
    this.messages.set(id, msg);

    const conv = this.conversations.get(data.conversation_id);
    if (conv) {
      conv.updated_at = now;
    }
    return msg;
  }

  getMessages(
    conversationId: string,
    limit = 50,
    beforeCursor?: string,
  ): { messages: MessageRow[]; hasMore: boolean } {
    let list = Array.from(this.messages.values())
      .filter(m => m.conversation_id === conversationId)
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

    if (beforeCursor) {
      const cursorIndex = list.findIndex(m => m.id === beforeCursor);
      if (cursorIndex !== -1) {
        list = list.slice(cursorIndex + 1);
      }
    }

    const hasMore = list.length > limit;
    const items = list.slice(0, limit);
    return { messages: items, hasMore };
  }

  updateMessageStatus(
    messageId: string,
    status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED',
  ): MessageRow | undefined {
    const msg = this.messages.get(messageId);
    if (msg) {
      msg.status = status;
      if (status === 'DELIVERED' && !msg.delivered_at) msg.delivered_at = new Date();
      if (status === 'READ') {
        if (!msg.delivered_at) msg.delivered_at = new Date();
        msg.read_at = new Date();
      }
    }
    return msg;
  }

  addPreKeys(deviceId: string, keys: Array<{ key_id: number; public_key: string }>): void {
    const now = new Date();
    for (const k of keys) {
      const id = uuidv4();
      this.prekeys.set(id, {
        id,
        device_id: deviceId,
        key_id: k.key_id,
        public_key: k.public_key,
        created_at: now,
      });
    }
  }

  getPreKeys(deviceId: string): PreKeyRow[] {
    return Array.from(this.prekeys.values()).filter(p => p.device_id === deviceId);
  }
}

export const memoryDb = new MemoryDatabase();
