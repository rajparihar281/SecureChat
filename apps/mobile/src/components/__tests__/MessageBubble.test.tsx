import React from 'react';
import renderer from 'react-test-renderer';
import { MessageBubble } from '../MessageBubble';
import { ThemeProvider } from '../../theme';
import { MessageFieldsFragment, MessageStatus } from '@securechat/shared';

const mockMessage: MessageFieldsFragment = {
  id: 'm-101',
  conversationId: 'c-1',
  senderId: 'u-1',
  senderDeviceId: 'd-1',
  recipientId: 'u-2',
  status: MessageStatus.Delivered,
  createdAt: '2026-09-20T10:00:00Z',
  deliveredAt: '2026-09-20T10:00:05Z',
  readAt: null,
  encryptedPayload: {
    ciphertext: Buffer.from('Hello world!').toString('base64'),
    nonce: 'nonce_24_bytes_test',
    senderPublicKey: 'key_1',
    recipientPublicKey: 'key_2',
    version: 1,
  },
};

describe('MessageBubble', () => {
  it('renders outgoing message with delivery checkmarks', () => {
    const tree = renderer.create(
      <ThemeProvider>
        <MessageBubble message={mockMessage} isOutgoing={true} decryptedText="Hello world!" />
      </ThemeProvider>,
    );

    const root = tree.root;
    const textNodes = root.findAllByType('Text');
    const strings = textNodes.map(n => n.props.children).flat();
    expect(strings).toContain('Hello world!');
    expect(strings).toContain('✓✓');
  });

  it('renders incoming message with sender display name in group', () => {
    const tree = renderer.create(
      <ThemeProvider>
        <MessageBubble
          message={mockMessage}
          isOutgoing={false}
          senderName="Bob"
          decryptedText="Secret meeting at 5pm"
        />
      </ThemeProvider>,
    );

    const root = tree.root;
    const textNodes = root.findAllByType('Text');
    const strings = textNodes.map(n => n.props.children).flat();
    expect(strings).toContain('Secret meeting at 5pm');
    expect(strings).toContain('Bob');
  });

  it('renders retry button on FAILED status', () => {
    const failedMessage = {
      ...mockMessage,
      status: MessageStatus.Failed,
    };
    const onRetry = jest.fn();

    const tree = renderer.create(
      <ThemeProvider>
        <MessageBubble message={failedMessage} isOutgoing={true} onRetry={onRetry} />
      </ThemeProvider>,
    );

    const root = tree.root;
    const textNodes = root.findAllByType('Text');
    const strings = textNodes.map(n => n.props.children).flat();
    expect(strings.some(s => typeof s === 'string' && s.includes('Retry'))).toBe(true);
  });
});
