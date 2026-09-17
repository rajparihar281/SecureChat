/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> =
  T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type * as Types from './schema-types.js';

export type UserFieldsFragment = {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl: string | null | undefined;
  createdAt: string;
  updatedAt: string;
};

export type DeviceFieldsFragment = {
  id: string;
  deviceId: string;
  deviceName: string;
  platform: Types.DevicePlatform;
  publicKey: string;
  lastActiveAt: string;
  createdAt: string;
};

export type EncryptedPayloadFieldsFragment = {
  ciphertext: string;
  nonce: string;
  senderPublicKey: string;
  recipientPublicKey: string;
  version: number;
};

export type MessageFieldsFragment = {
  id: string;
  conversationId: string;
  senderId: string;
  senderDeviceId: string;
  recipientId: string | null | undefined;
  status: Types.MessageStatus;
  createdAt: string;
  deliveredAt: string | null | undefined;
  readAt: string | null | undefined;
  encryptedPayload: {
    ciphertext: string;
    nonce: string;
    senderPublicKey: string;
    recipientPublicKey: string;
    version: number;
  };
};

export type ConversationFieldsFragment = {
  id: string;
  isGroup: boolean;
  name: string | null | undefined;
  createdBy: string | null | undefined;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  participants: Array<{
    id: string;
    username: string;
    email: string;
    displayName: string;
    avatarUrl: string | null | undefined;
    createdAt: string;
    updatedAt: string;
  }>;
  lastMessage:
    | {
        id: string;
        conversationId: string;
        senderId: string;
        senderDeviceId: string;
        recipientId: string | null | undefined;
        status: Types.MessageStatus;
        createdAt: string;
        deliveredAt: string | null | undefined;
        readAt: string | null | undefined;
        encryptedPayload: {
          ciphertext: string;
          nonce: string;
          senderPublicKey: string;
          recipientPublicKey: string;
          version: number;
        };
      }
    | null
    | undefined;
};

export type GetMeQueryVariables = Exact<{ [key: string]: never }>;

export type GetMeQuery = {
  me: {
    id: string;
    username: string;
    email: string;
    displayName: string;
    avatarUrl: string | null | undefined;
    createdAt: string;
    updatedAt: string;
  };
};

export type GetUsersQueryVariables = Exact<{
  query?: string | null | undefined;
}>;

export type GetUsersQuery = {
  users: Array<{
    id: string;
    username: string;
    email: string;
    displayName: string;
    avatarUrl: string | null | undefined;
    createdAt: string;
    updatedAt: string;
  }>;
};

export type GetConversationQueryVariables = Exact<{
  id: string;
}>;

export type GetConversationQuery = {
  conversation:
    | {
        id: string;
        isGroup: boolean;
        name: string | null | undefined;
        createdBy: string | null | undefined;
        unreadCount: number;
        createdAt: string;
        updatedAt: string;
        participants: Array<{
          id: string;
          username: string;
          email: string;
          displayName: string;
          avatarUrl: string | null | undefined;
          createdAt: string;
          updatedAt: string;
        }>;
        lastMessage:
          | {
              id: string;
              conversationId: string;
              senderId: string;
              senderDeviceId: string;
              recipientId: string | null | undefined;
              status: Types.MessageStatus;
              createdAt: string;
              deliveredAt: string | null | undefined;
              readAt: string | null | undefined;
              encryptedPayload: {
                ciphertext: string;
                nonce: string;
                senderPublicKey: string;
                recipientPublicKey: string;
                version: number;
              };
            }
          | null
          | undefined;
      }
    | null
    | undefined;
};

export type GetConversationsQueryVariables = Exact<{
  limit?: number | null | undefined;
  offset?: number | null | undefined;
}>;

export type GetConversationsQuery = {
  conversations: Array<{
    id: string;
    isGroup: boolean;
    name: string | null | undefined;
    createdBy: string | null | undefined;
    unreadCount: number;
    createdAt: string;
    updatedAt: string;
    participants: Array<{
      id: string;
      username: string;
      email: string;
      displayName: string;
      avatarUrl: string | null | undefined;
      createdAt: string;
      updatedAt: string;
    }>;
    lastMessage:
      | {
          id: string;
          conversationId: string;
          senderId: string;
          senderDeviceId: string;
          recipientId: string | null | undefined;
          status: Types.MessageStatus;
          createdAt: string;
          deliveredAt: string | null | undefined;
          readAt: string | null | undefined;
          encryptedPayload: {
            ciphertext: string;
            nonce: string;
            senderPublicKey: string;
            recipientPublicKey: string;
            version: number;
          };
        }
      | null
      | undefined;
  }>;
};

export type GetMessagesQueryVariables = Exact<{
  conversationId: string;
  limit?: number | null | undefined;
  beforeCursor?: string | null | undefined;
}>;

export type GetMessagesQuery = {
  messages: {
    hasMore: boolean;
    nextCursor: string | null | undefined;
    items: Array<{
      id: string;
      conversationId: string;
      senderId: string;
      senderDeviceId: string;
      recipientId: string | null | undefined;
      status: Types.MessageStatus;
      createdAt: string;
      deliveredAt: string | null | undefined;
      readAt: string | null | undefined;
      encryptedPayload: {
        ciphertext: string;
        nonce: string;
        senderPublicKey: string;
        recipientPublicKey: string;
        version: number;
      };
    }>;
  };
};

export type GetDeviceKeysQueryVariables = Exact<{
  userId: string;
}>;

export type GetDeviceKeysQuery = {
  deviceKeys: Array<{
    deviceId: string;
    deviceName: string;
    publicKey: string;
    preKey: string | null | undefined;
  }>;
};

export type RegisterMutationVariables = Exact<{
  input: Types.RegisterInput;
}>;

export type RegisterMutation = {
  register: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: {
      id: string;
      username: string;
      email: string;
      displayName: string;
      avatarUrl: string | null | undefined;
      createdAt: string;
      updatedAt: string;
    };
    device: {
      id: string;
      deviceId: string;
      deviceName: string;
      platform: Types.DevicePlatform;
      publicKey: string;
      lastActiveAt: string;
      createdAt: string;
    };
  };
};

export type LoginMutationVariables = Exact<{
  input: Types.LoginInput;
}>;

export type LoginMutation = {
  login: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: {
      id: string;
      username: string;
      email: string;
      displayName: string;
      avatarUrl: string | null | undefined;
      createdAt: string;
      updatedAt: string;
    };
    device: {
      id: string;
      deviceId: string;
      deviceName: string;
      platform: Types.DevicePlatform;
      publicKey: string;
      lastActiveAt: string;
      createdAt: string;
    };
  };
};

export type RefreshTokenMutationVariables = Exact<{
  input: Types.RefreshTokenInput;
}>;

export type RefreshTokenMutation = {
  refreshToken: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
    user: {
      id: string;
      username: string;
      email: string;
      displayName: string;
      avatarUrl: string | null | undefined;
      createdAt: string;
      updatedAt: string;
    };
    device: {
      id: string;
      deviceId: string;
      deviceName: string;
      platform: Types.DevicePlatform;
      publicKey: string;
      lastActiveAt: string;
      createdAt: string;
    };
  };
};

export type LogoutMutationVariables = Exact<{ [key: string]: never }>;

export type LogoutMutation = { logout: boolean };

export type CreateConversationMutationVariables = Exact<{
  input: Types.CreateConversationInput;
}>;

export type CreateConversationMutation = {
  createConversation: {
    id: string;
    isGroup: boolean;
    name: string | null | undefined;
    createdBy: string | null | undefined;
    unreadCount: number;
    createdAt: string;
    updatedAt: string;
    participants: Array<{
      id: string;
      username: string;
      email: string;
      displayName: string;
      avatarUrl: string | null | undefined;
      createdAt: string;
      updatedAt: string;
    }>;
    lastMessage:
      | {
          id: string;
          conversationId: string;
          senderId: string;
          senderDeviceId: string;
          recipientId: string | null | undefined;
          status: Types.MessageStatus;
          createdAt: string;
          deliveredAt: string | null | undefined;
          readAt: string | null | undefined;
          encryptedPayload: {
            ciphertext: string;
            nonce: string;
            senderPublicKey: string;
            recipientPublicKey: string;
            version: number;
          };
        }
      | null
      | undefined;
  };
};

export type SendMessageMutationVariables = Exact<{
  input: Types.SendMessageInput;
}>;

export type SendMessageMutation = {
  sendMessage: {
    id: string;
    conversationId: string;
    senderId: string;
    senderDeviceId: string;
    recipientId: string | null | undefined;
    status: Types.MessageStatus;
    createdAt: string;
    deliveredAt: string | null | undefined;
    readAt: string | null | undefined;
    encryptedPayload: {
      ciphertext: string;
      nonce: string;
      senderPublicKey: string;
      recipientPublicKey: string;
      version: number;
    };
  };
};

export type UpdateMessageStatusMutationVariables = Exact<{
  input: Types.UpdateMessageStatusInput;
}>;

export type UpdateMessageStatusMutation = {
  updateMessageStatus: {
    id: string;
    conversationId: string;
    senderId: string;
    senderDeviceId: string;
    recipientId: string | null | undefined;
    status: Types.MessageStatus;
    createdAt: string;
    deliveredAt: string | null | undefined;
    readAt: string | null | undefined;
    encryptedPayload: {
      ciphertext: string;
      nonce: string;
      senderPublicKey: string;
      recipientPublicKey: string;
      version: number;
    };
  };
};

export type SetTypingMutationVariables = Exact<{
  input: Types.SetTypingInput;
}>;

export type SetTypingMutation = { setTyping: boolean };

export type RegisterPushTokenMutationVariables = Exact<{
  input: Types.RegisterDeviceTokenInput;
}>;

export type RegisterPushTokenMutation = { registerPushToken: boolean };

export type UploadDeviceKeysMutationVariables = Exact<{
  input: Types.UploadDeviceKeysInput;
}>;

export type UploadDeviceKeysMutation = { uploadDeviceKeys: boolean };

export type OnMessageSentSubscriptionVariables = Exact<{
  conversationId: string;
}>;

export type OnMessageSentSubscription = {
  messageSent: {
    id: string;
    conversationId: string;
    senderId: string;
    senderDeviceId: string;
    recipientId: string | null | undefined;
    status: Types.MessageStatus;
    createdAt: string;
    deliveredAt: string | null | undefined;
    readAt: string | null | undefined;
    encryptedPayload: {
      ciphertext: string;
      nonce: string;
      senderPublicKey: string;
      recipientPublicKey: string;
      version: number;
    };
  };
};

export type OnMessageStatusUpdatedSubscriptionVariables = Exact<{
  conversationId: string;
}>;

export type OnMessageStatusUpdatedSubscription = {
  messageStatusUpdated: {
    messageId: string;
    conversationId: string;
    status: Types.MessageStatus;
    timestamp: string;
  };
};

export type OnUserTypingSubscriptionVariables = Exact<{
  conversationId: string;
}>;

export type OnUserTypingSubscription = {
  userTyping: { conversationId: string; userId: string; username: string; isTyping: boolean };
};
