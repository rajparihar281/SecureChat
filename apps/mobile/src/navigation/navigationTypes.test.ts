import {
  AuthStackParamList,
  MainTabParamList,
  ChatStackParamList,
  RootStackParamList,
} from './types';

describe('Navigation Types', () => {
  it('ensures type consistency for param lists', () => {
    const authParams: AuthStackParamList['Login'] = undefined;
    expect(authParams).toBeUndefined();

    const mainParams: MainTabParamList['Conversations'] = undefined;
    expect(mainParams).toBeUndefined();

    const rootParams: RootStackParamList['Main'] = undefined;
    expect(rootParams).toBeUndefined();

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
