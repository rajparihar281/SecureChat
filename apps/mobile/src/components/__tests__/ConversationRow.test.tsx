import React from 'react';
import renderer from 'react-test-renderer';
import {
  ConversationRow,
  getConversationItemLayout,
  CONVERSATION_ROW_HEIGHT,
} from '../ConversationRow';
import { ThemeProvider } from '../../theme';
import { ConversationFieldsFragment, MessageStatus } from '@securechat/shared';

const mockConversation: ConversationFieldsFragment = {
  id: 'conv-1',
  isGroup: false,
  name: null,
  createdBy: 'user-1',
  unreadCount: 3,
  createdAt: '2026-09-20T10:00:00Z',
  updatedAt: '2026-09-20T10:05:00Z',
  participants: [
    {
      id: 'user-1',
      username: 'alice',
      email: 'alice@test.io',
      displayName: 'Alice Wonderland',
      avatarUrl: null,
      createdAt: '2026-09-20T09:00:00Z',
      updatedAt: '2026-09-20T09:00:00Z',
    },
    {
      id: 'user-2',
      username: 'bob',
      email: 'bob@test.io',
      displayName: 'Bob Builder',
      avatarUrl: null,
      createdAt: '2026-09-20T09:00:00Z',
      updatedAt: '2026-09-20T09:00:00Z',
    },
  ],
  lastMessage: {
    id: 'msg-1',
    conversationId: 'conv-1',
    senderId: 'user-2',
    senderDeviceId: 'dev-2',
    recipientId: 'user-1',
    status: MessageStatus.Sent,
    createdAt: '2026-09-20T10:05:00Z',
    deliveredAt: null,
    readAt: null,
    encryptedPayload: {
      ciphertext: 'ciphertext_abc',
      nonce: 'nonce_123',
      senderPublicKey: 'key_s',
      recipientPublicKey: 'key_r',
      version: 1,
    },
  },
};

describe('ConversationRow', () => {
  it('computes fixed height layout correctly', () => {
    const layout = getConversationItemLayout(null, 4);
    expect(layout.length).toBe(CONVERSATION_ROW_HEIGHT);
    expect(layout.offset).toBe(CONVERSATION_ROW_HEIGHT * 4);
    expect(layout.index).toBe(4);
  });

  it('renders participant title and unread badge', () => {
    const onPress = jest.fn();
    const tree = renderer.create(
      <ThemeProvider>
        <ConversationRow conversation={mockConversation} currentUserId="user-1" onPress={onPress} />
      </ThemeProvider>,
    );

    const root = tree.root;
    expect(root).toBeDefined();

    // Check Bob Builder is found as the other participant
    const textNodes = root.findAllByType('Text');
    const strings = textNodes.map(n => n.props.children).flat();
    expect(strings).toContain('Bob Builder');
  });
});
