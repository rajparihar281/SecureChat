import {
  AuthStackParamList,
  MainTabParamList,
  ChatStackParamList,
  RootStackParamList,
} from './types';

describe('Navigation Types', () => {
  it('ensures type consistency for param lists', () => {
    // Type compile check
    const chatRoomParams: ChatStackParamList['ChatRoom'] = {
      conversationId: 'conv-123',
      recipientName: 'Alice',
      recipientPublicKey: 'base64_pub_key',
    };
    expect(chatRoomParams.conversationId).toBe('conv-123');
    expect(chatRoomParams.recipientName).toBe('Alice');

    const securityParams: ChatStackParamList['SecurityVerification'] = {
      userId: 'user-456',
      username: 'Bob',
      publicKey: 'pubkey-abc',
    };
    expect(securityParams.userId).toBe('user-456');
  });
});
