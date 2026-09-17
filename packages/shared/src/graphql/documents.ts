import { parse, DocumentNode } from 'graphql';

export const USER_FIELDS_FRAGMENT_DOC: DocumentNode = parse(`
  fragment UserFields on User {
    id
    username
    email
    displayName
    avatarUrl
    createdAt
    updatedAt
  }
`);

export const DEVICE_FIELDS_FRAGMENT_DOC: DocumentNode = parse(`
  fragment DeviceFields on Device {
    id
    deviceId
    deviceName
    platform
    publicKey
    lastActiveAt
    createdAt
  }
`);

export const ENCRYPTED_PAYLOAD_FIELDS_FRAGMENT_DOC: DocumentNode = parse(`
  fragment EncryptedPayloadFields on EncryptedPayload {
    ciphertext
    nonce
    senderPublicKey
    recipientPublicKey
    version
  }
`);

export const MESSAGE_FIELDS_FRAGMENT_DOC: DocumentNode = parse(`
  fragment MessageFields on Message {
    id
    conversationId
    senderId
    senderDeviceId
    recipientId
    encryptedPayload {
      ciphertext
      nonce
      senderPublicKey
      recipientPublicKey
      version
    }
    status
    createdAt
    deliveredAt
    readAt
  }
`);

export const CONVERSATION_FIELDS_FRAGMENT_DOC: DocumentNode = parse(`
  fragment ConversationFields on Conversation {
    id
    isGroup
    name
    createdBy
    participants {
      id
      username
      email
      displayName
      avatarUrl
      createdAt
      updatedAt
    }
    lastMessage {
      id
      conversationId
      senderId
      senderDeviceId
      recipientId
      encryptedPayload {
        ciphertext
        nonce
        senderPublicKey
        recipientPublicKey
        version
      }
      status
      createdAt
      deliveredAt
      readAt
    }
    unreadCount
    createdAt
    updatedAt
  }
`);

export const GET_ME_QUERY: DocumentNode = parse(`
  query GetMe {
    me {
      id
      username
      email
      displayName
      avatarUrl
      createdAt
      updatedAt
    }
  }
`);

export const GET_USERS_QUERY: DocumentNode = parse(`
  query GetUsers($query: String) {
    users(query: $query) {
      id
      username
      email
      displayName
      avatarUrl
      createdAt
      updatedAt
    }
  }
`);

export const GET_CONVERSATION_QUERY: DocumentNode = parse(`
  query GetConversation($id: ID!) {
    conversation(id: $id) {
      id
      isGroup
      name
      createdBy
      participants {
        id
        username
        email
        displayName
        avatarUrl
        createdAt
        updatedAt
      }
      lastMessage {
        id
        conversationId
        senderId
        senderDeviceId
        recipientId
        encryptedPayload {
          ciphertext
          nonce
          senderPublicKey
          recipientPublicKey
          version
        }
        status
        createdAt
        deliveredAt
        readAt
      }
      unreadCount
      createdAt
      updatedAt
    }
  }
`);

export const GET_CONVERSATIONS_QUERY: DocumentNode = parse(`
  query GetConversations($limit: Int, $offset: Int) {
    conversations(limit: $limit, offset: $offset) {
      id
      isGroup
      name
      createdBy
      participants {
        id
        username
        email
        displayName
        avatarUrl
        createdAt
        updatedAt
      }
      lastMessage {
        id
        conversationId
        senderId
        senderDeviceId
        recipientId
        encryptedPayload {
          ciphertext
          nonce
          senderPublicKey
          recipientPublicKey
          version
        }
        status
        createdAt
        deliveredAt
        readAt
      }
      unreadCount
      createdAt
      updatedAt
    }
  }
`);

export const GET_MESSAGES_QUERY: DocumentNode = parse(`
  query GetMessages($conversationId: ID!, $limit: Int, $beforeCursor: String) {
    messages(conversationId: $conversationId, limit: $limit, beforeCursor: $beforeCursor) {
      items {
        id
        conversationId
        senderId
        senderDeviceId
        recipientId
        encryptedPayload {
          ciphertext
          nonce
          senderPublicKey
          recipientPublicKey
          version
        }
        status
        createdAt
        deliveredAt
        readAt
      }
      hasMore
      nextCursor
    }
  }
`);

export const GET_DEVICE_KEYS_QUERY: DocumentNode = parse(`
  query GetDeviceKeys($userId: ID!) {
    deviceKeys(userId: $userId) {
      deviceId
      deviceName
      publicKey
      preKey
    }
  }
`);

export const REGISTER_MUTATION: DocumentNode = parse(`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      user {
        id
        username
        email
        displayName
        avatarUrl
        createdAt
        updatedAt
      }
      device {
        id
        deviceId
        deviceName
        platform
        publicKey
        lastActiveAt
        createdAt
      }
      accessToken
      refreshToken
      expiresIn
    }
  }
`);

export const LOGIN_MUTATION: DocumentNode = parse(`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      user {
        id
        username
        email
        displayName
        avatarUrl
        createdAt
        updatedAt
      }
      device {
        id
        deviceId
        deviceName
        platform
        publicKey
        lastActiveAt
        createdAt
      }
      accessToken
      refreshToken
      expiresIn
    }
  }
`);

export const REFRESH_TOKEN_MUTATION: DocumentNode = parse(`
  mutation RefreshToken($input: RefreshTokenInput!) {
    refreshToken(input: $input) {
      user {
        id
        username
        email
        displayName
        avatarUrl
        createdAt
        updatedAt
      }
      device {
        id
        deviceId
        deviceName
        platform
        publicKey
        lastActiveAt
        createdAt
      }
      accessToken
      refreshToken
      expiresIn
    }
  }
`);

export const LOGOUT_MUTATION: DocumentNode = parse(`
  mutation Logout {
    logout
  }
`);

export const CREATE_CONVERSATION_MUTATION: DocumentNode = parse(`
  mutation CreateConversation($input: CreateConversationInput!) {
    createConversation(input: $input) {
      id
      isGroup
      name
      createdBy
      participants {
        id
        username
        email
        displayName
        avatarUrl
        createdAt
        updatedAt
      }
      lastMessage {
        id
        conversationId
        senderId
        senderDeviceId
        recipientId
        encryptedPayload {
          ciphertext
          nonce
          senderPublicKey
          recipientPublicKey
          version
        }
        status
        createdAt
        deliveredAt
        readAt
      }
      unreadCount
      createdAt
      updatedAt
    }
  }
`);

export const SEND_MESSAGE_MUTATION: DocumentNode = parse(`
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input) {
      id
      conversationId
      senderId
      senderDeviceId
      recipientId
      encryptedPayload {
        ciphertext
        nonce
        senderPublicKey
        recipientPublicKey
        version
      }
      status
      createdAt
      deliveredAt
      readAt
    }
  }
`);

export const UPDATE_MESSAGE_STATUS_MUTATION: DocumentNode = parse(`
  mutation UpdateMessageStatus($input: UpdateMessageStatusInput!) {
    updateMessageStatus(input: $input) {
      id
      conversationId
      senderId
      senderDeviceId
      recipientId
      encryptedPayload {
        ciphertext
        nonce
        senderPublicKey
        recipientPublicKey
        version
      }
      status
      createdAt
      deliveredAt
      readAt
    }
  }
`);

export const SET_TYPING_MUTATION: DocumentNode = parse(`
  mutation SetTyping($input: SetTypingInput!) {
    setTyping(input: $input)
  }
`);

export const REGISTER_PUSH_TOKEN_MUTATION: DocumentNode = parse(`
  mutation RegisterPushToken($input: RegisterDeviceTokenInput!) {
    registerPushToken(input: $input)
  }
`);

export const UPLOAD_DEVICE_KEYS_MUTATION: DocumentNode = parse(`
  mutation UploadDeviceKeys($input: UploadDeviceKeysInput!) {
    uploadDeviceKeys(input: $input)
  }
`);

export const ON_MESSAGE_SENT_SUBSCRIPTION: DocumentNode = parse(`
  subscription OnMessageSent($conversationId: ID!) {
    messageSent(conversationId: $conversationId) {
      id
      conversationId
      senderId
      senderDeviceId
      recipientId
      encryptedPayload {
        ciphertext
        nonce
        senderPublicKey
        recipientPublicKey
        version
      }
      status
      createdAt
      deliveredAt
      readAt
    }
  }
`);

export const ON_MESSAGE_STATUS_UPDATED_SUBSCRIPTION: DocumentNode = parse(`
  subscription OnMessageStatusUpdated($conversationId: ID!) {
    messageStatusUpdated(conversationId: $conversationId) {
      messageId
      conversationId
      status
      timestamp
    }
  }
`);

export const ON_USER_TYPING_SUBSCRIPTION: DocumentNode = parse(`
  subscription OnUserTyping($conversationId: ID!) {
    userTyping(conversationId: $conversationId) {
      conversationId
      userId
      username
      isTyping
    }
  }
`);
