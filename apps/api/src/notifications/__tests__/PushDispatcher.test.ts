import { PushDispatcher } from '../PushDispatcher.js';

describe('PushDispatcher - Backend Zero-Plaintext Notifications', () => {
  let dispatcher: PushDispatcher;

  beforeEach(() => {
    dispatcher = PushDispatcher.getInstance();
    dispatcher.initialize();
    dispatcher.setMockMode(true);
  });

  it('maintains a singleton instance', () => {
    const instance2 = PushDispatcher.getInstance();
    expect(dispatcher).toBe(instance2);
  });

  it('rejects sending notifications when recipient token is missing', async () => {
    const result = await dispatcher.sendNewMessageNotification({
      recipientPushToken: '',
      conversationId: 'conv-123',
      senderId: 'user-456',
      senderName: 'Alice',
      messageId: 'msg-789',
    });

    expect(result).toBe(false);
  });

  it('successfully dispatches zero-plaintext push notification in mock mode', async () => {
    const result = await dispatcher.sendNewMessageNotification({
      recipientPushToken: 'fcm_recipient_device_token',
      conversationId: 'conv-123',
      senderId: 'user-456',
      senderName: 'Bob Builder',
      messageId: 'msg-789',
    });

    expect(result).toBe(true);
  });
});
