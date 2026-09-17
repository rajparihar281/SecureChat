export type Maybe<T> = T | null | undefined;
export type InputMaybe<T> = T | null | undefined;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  accessToken: Scalars['String']['output'];
  device: Device;
  expiresIn: Scalars['Int']['output'];
  refreshToken: Scalars['String']['output'];
  user: User;
};

export type Conversation = {
  __typename?: 'Conversation';
  createdAt: Scalars['String']['output'];
  createdBy?: Maybe<Scalars['ID']['output']>;
  id: Scalars['ID']['output'];
  isGroup: Scalars['Boolean']['output'];
  lastMessage?: Maybe<Message>;
  name?: Maybe<Scalars['String']['output']>;
  participants: Array<User>;
  unreadCount: Scalars['Int']['output'];
  updatedAt: Scalars['String']['output'];
};

export type CreateConversationInput = {
  isGroup?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  participantIds: Array<Scalars['ID']['input']>;
};

export type Device = {
  __typename?: 'Device';
  createdAt: Scalars['String']['output'];
  deviceId: Scalars['String']['output'];
  deviceName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastActiveAt: Scalars['String']['output'];
  platform: DevicePlatform;
  publicKey: Scalars['String']['output'];
};

export type DeviceKeyBundle = {
  __typename?: 'DeviceKeyBundle';
  deviceId: Scalars['String']['output'];
  deviceName: Scalars['String']['output'];
  preKey?: Maybe<Scalars['String']['output']>;
  publicKey: Scalars['String']['output'];
};

export enum DevicePlatform {
  Android = 'ANDROID',
  Ios = 'IOS',
  Web = 'WEB',
}

export type EncryptedPayload = {
  __typename?: 'EncryptedPayload';
  ciphertext: Scalars['String']['output'];
  nonce: Scalars['String']['output'];
  recipientPublicKey: Scalars['String']['output'];
  senderPublicKey: Scalars['String']['output'];
  version: Scalars['Int']['output'];
};

export type EncryptedPayloadInput = {
  ciphertext: Scalars['String']['input'];
  nonce: Scalars['String']['input'];
  recipientPublicKey: Scalars['String']['input'];
  senderPublicKey: Scalars['String']['input'];
  version: Scalars['Int']['input'];
};

export type LoginInput = {
  deviceId: Scalars['String']['input'];
  deviceName: Scalars['String']['input'];
  identifier: Scalars['String']['input'];
  password: Scalars['String']['input'];
  platform: DevicePlatform;
  publicKey: Scalars['String']['input'];
};

export type Message = {
  __typename?: 'Message';
  conversationId: Scalars['ID']['output'];
  createdAt: Scalars['String']['output'];
  deliveredAt?: Maybe<Scalars['String']['output']>;
  encryptedPayload: EncryptedPayload;
  id: Scalars['ID']['output'];
  readAt?: Maybe<Scalars['String']['output']>;
  recipientId?: Maybe<Scalars['ID']['output']>;
  senderDeviceId: Scalars['String']['output'];
  senderId: Scalars['ID']['output'];
  status: MessageStatus;
};

export type MessageConnection = {
  __typename?: 'MessageConnection';
  hasMore: Scalars['Boolean']['output'];
  items: Array<Message>;
  nextCursor?: Maybe<Scalars['String']['output']>;
};

export enum MessageStatus {
  Delivered = 'DELIVERED',
  Failed = 'FAILED',
  Pending = 'PENDING',
  Read = 'READ',
  Sent = 'SENT',
}

export type MessageStatusUpdatePayload = {
  __typename?: 'MessageStatusUpdatePayload';
  conversationId: Scalars['ID']['output'];
  messageId: Scalars['ID']['output'];
  status: MessageStatus;
  timestamp: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createConversation: Conversation;
  login: AuthPayload;
  logout: Scalars['Boolean']['output'];
  refreshToken: AuthPayload;
  register: AuthPayload;
  registerPushToken: Scalars['Boolean']['output'];
  sendMessage: Message;
  setTyping: Scalars['Boolean']['output'];
  updateMessageStatus: Message;
  uploadDeviceKeys: Scalars['Boolean']['output'];
};

export type MutationCreateConversationArgs = {
  input: CreateConversationInput;
};

export type MutationLoginArgs = {
  input: LoginInput;
};

export type MutationRefreshTokenArgs = {
  input: RefreshTokenInput;
};

export type MutationRegisterArgs = {
  input: RegisterInput;
};

export type MutationRegisterPushTokenArgs = {
  input: RegisterDeviceTokenInput;
};

export type MutationSendMessageArgs = {
  input: SendMessageInput;
};

export type MutationSetTypingArgs = {
  input: SetTypingInput;
};

export type MutationUpdateMessageStatusArgs = {
  input: UpdateMessageStatusInput;
};

export type MutationUploadDeviceKeysArgs = {
  input: UploadDeviceKeysInput;
};

export type PreKeyInput = {
  keyId: Scalars['Int']['input'];
  publicKey: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  conversation?: Maybe<Conversation>;
  conversations: Array<Conversation>;
  deviceKeys: Array<DeviceKeyBundle>;
  me: User;
  messages: MessageConnection;
  users: Array<User>;
};

export type QueryConversationArgs = {
  id: Scalars['ID']['input'];
};

export type QueryConversationsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryDeviceKeysArgs = {
  userId: Scalars['ID']['input'];
};

export type QueryMessagesArgs = {
  beforeCursor?: InputMaybe<Scalars['String']['input']>;
  conversationId: Scalars['ID']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryUsersArgs = {
  query?: InputMaybe<Scalars['String']['input']>;
};

export type RefreshTokenInput = {
  refreshToken: Scalars['String']['input'];
};

export type RegisterDeviceTokenInput = {
  pushToken: Scalars['String']['input'];
};

export type RegisterInput = {
  deviceId: Scalars['String']['input'];
  deviceName: Scalars['String']['input'];
  displayName: Scalars['String']['input'];
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
  platform: DevicePlatform;
  publicKey: Scalars['String']['input'];
  username: Scalars['String']['input'];
};

export type SendMessageInput = {
  clientMutationId?: InputMaybe<Scalars['String']['input']>;
  conversationId: Scalars['ID']['input'];
  encryptedPayload: EncryptedPayloadInput;
  recipientId?: InputMaybe<Scalars['ID']['input']>;
};

export type SetTypingInput = {
  conversationId: Scalars['ID']['input'];
  isTyping: Scalars['Boolean']['input'];
};

export type Subscription = {
  __typename?: 'Subscription';
  messageSent: Message;
  messageStatusUpdated: MessageStatusUpdatePayload;
  userTyping: UserTypingPayload;
};

export type SubscriptionMessageSentArgs = {
  conversationId: Scalars['ID']['input'];
};

export type SubscriptionMessageStatusUpdatedArgs = {
  conversationId: Scalars['ID']['input'];
};

export type SubscriptionUserTypingArgs = {
  conversationId: Scalars['ID']['input'];
};

export type UpdateMessageStatusInput = {
  messageId: Scalars['ID']['input'];
  status: MessageStatus;
};

export type UploadDeviceKeysInput = {
  identityKey: Scalars['String']['input'];
  preKeys: Array<PreKeyInput>;
};

export type User = {
  __typename?: 'User';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  displayName: Scalars['String']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  updatedAt: Scalars['String']['output'];
  username: Scalars['String']['output'];
};

export type UserTypingPayload = {
  __typename?: 'UserTypingPayload';
  conversationId: Scalars['ID']['output'];
  isTyping: Scalars['Boolean']['output'];
  userId: Scalars['ID']['output'];
  username: Scalars['String']['output'];
};
