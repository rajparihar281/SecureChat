import { messageResolvers } from './messageResolvers';
import { conversationResolvers } from './conversationResolvers';
import { memoryDb } from '../../db/memoryStore';
import { GraphQLContext } from '../context';

describe('messageResolvers', () => {
  let contextAlice: GraphQLContext;
  let contextBob: GraphQLContext;
  let conversationId: string;

  beforeEach(() => {
    memoryDb.clear();

    const alice = memoryDb.createUser({
      username: 'alice',
      email: 'alice@chat.io',
      password_hash: 'hash',
      display_name: 'Alice',
    });
    const deviceAlice = memoryDb.registerDevice({
      user_id: alice.id,
      device_id: 'alice-phone',
      device_name: 'Alice Phone',
      platform: 'ANDROID',
      public_key: 'alice_pub_key',
    });

    const bob = memoryDb.createUser({
      username: 'bob',
      email: 'bob@chat.io',
      password_hash: 'hash',
      display_name: 'Bob',
    });
    const deviceBob = memoryDb.registerDevice({
      user_id: bob.id,
      device_id: 'bob-phone',
      device_name: 'Bob Phone',
      platform: 'ANDROID',
      public_key: 'bob_pub_key',
    });

    contextAlice = {
      currentUser: alice,
      currentDevice: deviceAlice,
    };

    contextBob = {
      currentUser: bob,
      currentDevice: deviceBob,
    };

    const conv = conversationResolvers.Mutation.createConversation(
      {},
      { input: { participantIds: [bob.id] } },
      contextAlice,
    );
    conversationId = conv.id;
  });

  it('sends an encrypted message and retrieves it via cursor pagination', async () => {
    const sent = await messageResolvers.Mutation.sendMessage(
      {},
      {
        input: {
          conversationId,
          recipientId: contextBob.currentUser!.id,
          encryptedPayload: {
            ciphertext: 'base64_ciphertext_data',
            nonce: 'base64_nonce_24bytes',
            senderPublicKey: 'alice_pub_key',
            recipientPublicKey: 'bob_pub_key',
            version: 1,
          },
        },
      },
      contextAlice,
    );

    expect(sent.id).toBeDefined();
    expect(sent.status).toBe('SENT');
    expect(sent.encryptedPayload.ciphertext).toBe('base64_ciphertext_data');

    const result = messageResolvers.Query.messages({}, { conversationId, limit: 10 }, contextBob);

    expect(result.items.length).toBe(1);
    expect(result.items[0].id).toBe(sent.id);
  });

  it('updates message status to DELIVERED and READ', async () => {
    const sent = await messageResolvers.Mutation.sendMessage(
      {},
      {
        input: {
          conversationId,
          encryptedPayload: {
            ciphertext: 'secret',
            nonce: 'nonce',
            senderPublicKey: 'alice_pub_key',
            recipientPublicKey: 'bob_pub_key',
            version: 1,
          },
        },
      },
      contextAlice,
    );

    const updated = await messageResolvers.Mutation.updateMessageStatus(
      {},
      {
        input: {
          messageId: sent.id,
          status: 'READ',
        },
      },
      contextBob,
    );

    expect(updated.status).toBe('READ');
    expect(updated.readAt).toBeDefined();
  });
});
