import { OfflineQueueManager, QueuedMessage } from '../OfflineQueueManager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NetInfo } from '../../__mocks__/@react-native-community/netinfo';

const mockQueuedMessage: QueuedMessage = {
  clientMutationId: 'mut_test_1',
  tempId: 'temp_test_1',
  conversationId: 'conv_1',
  recipientId: 'user_2',
  encryptedPayload: {
    ciphertext: 'test_cipher',
    nonce: 'test_nonce',
    senderPublicKey: 'key_1',
    recipientPublicKey: 'key_2',
    version: 1,
  },
  plaintextPreview: 'Hello offline!',
  createdAt: '2026-09-22T10:00:00Z',
  retryCount: 0,
  status: 'PENDING',
};

describe('OfflineQueueManager', () => {
  let queueManager: OfflineQueueManager;

  beforeEach(async () => {
    await AsyncStorage.clear();
    NetInfo.__resetListeners();
    queueManager = OfflineQueueManager.getInstance();
    await queueManager.clearQueue();
    await queueManager.initialize();
  });

  afterEach(() => {
    queueManager.destroy();
  });

  it('enqueues messages and persists to AsyncStorage', async () => {
    await queueManager.enqueue(mockQueuedMessage);

    const queue = queueManager.getQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0]?.clientMutationId).toBe('mut_test_1');
    expect(queue[0]?.status).toBe('PENDING');

    // Verify storage persistence
    const stored = await AsyncStorage.getItem('@securechat:offline_message_queue');
    expect(stored).toBeTruthy();
    const parsed = JSON.parse(stored!);
    expect(parsed[0].clientMutationId).toBe('mut_test_1');
  });

  it('dequeues messages upon delivery', async () => {
    await queueManager.enqueue(mockQueuedMessage);
    expect(queueManager.getQueue()).toHaveLength(1);

    await queueManager.dequeue('mut_test_1');
    expect(queueManager.getQueue()).toHaveLength(0);
  });

  it('marks message as failed and increments retryCount', async () => {
    await queueManager.enqueue(mockQueuedMessage);
    await queueManager.markFailed('mut_test_1');

    const queue = queueManager.getQueue();
    expect(queue[0]?.status).toBe('FAILED');
    expect(queue[0]?.retryCount).toBe(1);
  });

  it('flushes queue sequentially through the sender handler', async () => {
    await queueManager.enqueue(mockQueuedMessage);

    const mockSender = jest.fn().mockResolvedValue(true);
    queueManager.setSender(mockSender);

    await queueManager.flushQueue();

    expect(mockSender).toHaveBeenCalledTimes(1);
    expect(mockSender).toHaveBeenCalledWith(
      expect.objectContaining({ clientMutationId: 'mut_test_1' }),
    );
    expect(queueManager.getQueue()).toHaveLength(0);
  });

  it('triggers auto-retry flush on NetInfo network reconnect', async () => {
    // Start offline
    NetInfo.__simulateNetworkChange(false);
    await queueManager.enqueue(mockQueuedMessage);

    const mockSender = jest.fn().mockResolvedValue(true);
    queueManager.setSender(mockSender);

    // Reconnect network
    NetInfo.__simulateNetworkChange(true);

    // Wait for async flush
    await new Promise(resolve => setTimeout(resolve, 50));

    expect(mockSender).toHaveBeenCalledTimes(1);
    expect(queueManager.getQueue()).toHaveLength(0);
  });
});
