import React from 'react';
import renderer from 'react-test-renderer';
import { Button } from '../Button';
import { Input } from '../Input';
import { Header } from '../Header';
import { ConversationRow } from '../ConversationRow';
import { MessageBubble } from '../MessageBubble';
import { Avatar } from '../Avatar';
import { ErrorBoundary } from '../ErrorBoundary';
import { ThemeProvider } from '../../theme';
import {
  ConversationFieldsFragment,
  MessageFieldsFragment,
  MessageStatus,
} from '@securechat/shared';

const mockConversation: ConversationFieldsFragment = {
  id: 'conv-acc-1',
  isGroup: false,
  name: null,
  createdBy: 'user-1',
  unreadCount: 2,
  createdAt: '2026-09-20T10:00:00Z',
  updatedAt: '2026-09-20T10:05:00Z',
  participants: [
    {
      id: 'user-1',
      username: 'alice',
      email: 'alice@test.io',
      displayName: 'Alice',
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
    id: 'msg-acc-1',
    conversationId: 'conv-acc-1',
    senderId: 'user-2',
    senderDeviceId: 'dev-2',
    recipientId: 'user-1',
    status: MessageStatus.Delivered,
    createdAt: '2026-09-20T10:05:00Z',
    deliveredAt: '2026-09-20T10:05:01Z',
    readAt: null,
    encryptedPayload: {
      ciphertext: 'ciphertext_xyz',
      nonce: 'nonce_xyz',
      senderPublicKey: 'key_s',
      recipientPublicKey: 'key_r',
      version: 1,
    },
  },
};

const mockMessage: MessageFieldsFragment = {
  id: 'msg-acc-bubble',
  conversationId: 'conv-acc-1',
  senderId: 'user-1',
  senderDeviceId: 'dev-1',
  recipientId: 'user-2',
  status: MessageStatus.Delivered,
  createdAt: '2026-09-20T10:05:00Z',
  deliveredAt: '2026-09-20T10:05:01Z',
  readAt: null,
  encryptedPayload: {
    ciphertext: 'ciphertext_xyz',
    nonce: 'nonce_xyz',
    senderPublicKey: 'key_s',
    recipientPublicKey: 'key_r',
    version: 1,
  },
};

describe('Accessibility Attributes', () => {
  it('verifies Button accessibilityRole and accessibilityLabel', () => {
    const onPress = jest.fn();
    const tree = renderer.create(
      <ThemeProvider>
        <Button
          title="Submit Payment"
          onPress={onPress}
          accessibilityLabel="Submit encrypted payment"
        />
      </ThemeProvider>,
    );
    const touchable = tree.root.findByType('TouchableOpacity');
    expect(touchable.props.accessible).toBe(true);
    expect(touchable.props.accessibilityRole).toBe('button');
    expect(touchable.props.accessibilityLabel).toBe('Submit encrypted payment');
  });

  it('verifies Input accessible and accessibilityLabel', () => {
    const tree = renderer.create(
      <ThemeProvider>
        <Input
          label="Email Address"
          placeholder="name@example.com"
          helperText="Your registered email"
        />
      </ThemeProvider>,
    );
    const textInput = tree.root.findByType('TextInput');
    expect(textInput.props.accessible).toBe(true);
    expect(textInput.props.accessibilityLabel).toBe('Email Address');
    expect(textInput.props.accessibilityHint).toBe('Your registered email');
  });

  it('verifies Header accessibilityRole for header bar and back action', () => {
    const onBack = jest.fn();
    const tree = renderer.create(
      <ThemeProvider>
        <Header title="Encrypted Room" onBack={onBack} subtitle="E2EE active" />
      </ThemeProvider>,
    );
    const views = tree.root.findAllByType('View');
    const headerBar = views.find(v => v.props.accessibilityRole === 'header');
    expect(headerBar).toBeDefined();
    expect(headerBar?.props.accessibilityLabel).toBe('Encrypted Room');

    const backButton = tree.root.findByType('TouchableOpacity');
    expect(backButton.props.accessibilityRole).toBe('button');
    expect(backButton.props.accessibilityLabel).toBe('Go back');
  });

  it('verifies ConversationRow accessibilityRole and label with unread indicator', () => {
    const onPress = jest.fn();
    const tree = renderer.create(
      <ThemeProvider>
        <ConversationRow conversation={mockConversation} currentUserId="user-1" onPress={onPress} />
      </ThemeProvider>,
    );
    const touchable = tree.root.findByType('TouchableOpacity');
    expect(touchable.props.accessible).toBe(true);
    expect(touchable.props.accessibilityRole).toBe('button');
    expect(touchable.props.accessibilityLabel).toContain('Conversation with Bob Builder');
    expect(touchable.props.accessibilityLabel).toContain('2 unread messages');
  });

  it('verifies MessageBubble accessibilityRole and outgoing sender context', () => {
    const tree = renderer.create(
      <ThemeProvider>
        <MessageBubble
          message={mockMessage}
          isOutgoing={true}
          decryptedText="Secret meeting at noon"
        />
      </ThemeProvider>,
    );
    const views = tree.root.findAllByType('View');
    const bubbleView = views.find(v => v.props.accessibilityRole === 'text');
    expect(bubbleView).toBeDefined();
    expect(bubbleView?.props.accessible).toBe(true);
    expect(bubbleView?.props.accessibilityLabel).toContain('Sent message: Secret meeting at noon');
  });

  it('verifies Avatar accessibilityRole and descriptive label', () => {
    const tree = renderer.create(
      <ThemeProvider>
        <Avatar name="Charlie Brown" size={48} isOnline={true} />
      </ThemeProvider>,
    );
    const views = tree.root.findAllByType('View');
    const avatarView = views.find(v => v.props.accessibilityRole === 'image');
    expect(avatarView).toBeDefined();
    expect(avatarView?.props.accessible).toBe(true);
    expect(avatarView?.props.accessibilityLabel).toBe("Charlie Brown's avatar");
  });

  it('verifies ErrorBoundary accessibility alert and recovery action', () => {
    const ProblemChild: React.FC = () => {
      throw new Error('Test crash in accessibility suite');
    };

    // Suppress expected console.error during ErrorBoundary boundary catch
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const tree = renderer.create(
      <ErrorBoundary>
        <ProblemChild />
      </ErrorBoundary>,
    );
    spy.mockRestore();

    const views = tree.root.findAllByType('View');
    const alertView = views.find(v => v.props.accessibilityRole === 'alert');
    expect(alertView).toBeDefined();
    expect(alertView?.props.accessible).toBe(true);
    expect(alertView?.props.accessibilityLabel).toBe('Application error view');

    const button = tree.root.findByType('TouchableOpacity');
    expect(button.props.accessibilityRole).toBe('button');
    expect(button.props.accessibilityLabel).toBe('Try again to reload application');
  });
});
