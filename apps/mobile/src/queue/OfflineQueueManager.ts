import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { EncryptedPayloadInput } from '@securechat/shared';

export interface QueuedMessage {
  clientMutationId: string;
  tempId: string;
  conversationId: string;
  recipientId?: string | null;
  encryptedPayload: EncryptedPayloadInput;
  plaintextPreview: string;
  createdAt: string;
  retryCount: number;
  status: 'PENDING' | 'FAILED';
}

export type MessageSender = (message: QueuedMessage) => Promise<boolean>;

const QUEUE_STORAGE_KEY = '@securechat:offline_message_queue';

export class OfflineQueueManager {
  private static instance: OfflineQueueManager | null = null;

  private queue: QueuedMessage[] = [];
  private sender: MessageSender | null = null;
  private isFlushing = false;
  private isInitialized = false;
  private isOnline = true;
  private unsubscribeNetInfo: (() => void) | null = null;

  public static getInstance(): OfflineQueueManager {
    if (!OfflineQueueManager.instance) {
      OfflineQueueManager.instance = new OfflineQueueManager();
    }
    return OfflineQueueManager.instance;
  }

  public setSender(sender: MessageSender): void {
    this.sender = sender;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      const stored = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored) as QueuedMessage[];
      }
    } catch {
      this.queue = [];
    }

    this.unsubscribeNetInfo = NetInfo.addEventListener((state: NetInfoState) => {
      const online = !!state.isConnected && state.isInternetReachable !== false;
      const wasOffline = !this.isOnline;
      this.isOnline = online;

      if (online && wasOffline) {
        this.flushQueue().catch(() => {});
      }
    });

    const currentState = await NetInfo.fetch();
    this.isOnline = !!currentState.isConnected && currentState.isInternetReachable !== false;
    this.isInitialized = true;
  }

  public async enqueue(message: QueuedMessage): Promise<void> {
    const existingIndex = this.queue.findIndex(
      m => m.clientMutationId === message.clientMutationId,
    );

    if (existingIndex >= 0) {
      this.queue[existingIndex] = { ...message };
    } else {
      this.queue.push({ ...message });
    }

    await this.persist();
  }

  public async dequeue(clientMutationId: string): Promise<void> {
    this.queue = this.queue.filter(m => m.clientMutationId !== clientMutationId);
    await this.persist();
  }

  public async markFailed(clientMutationId: string): Promise<void> {
    const item = this.queue.find(m => m.clientMutationId === clientMutationId);
    if (item) {
      item.status = 'FAILED';
      item.retryCount += 1;
      await this.persist();
    }
  }

  public getQueue(): QueuedMessage[] {
    return [...this.queue];
  }

  public getQueueForConversation(conversationId: string): QueuedMessage[] {
    return this.queue.filter(m => m.conversationId === conversationId);
  }

  public async flushQueue(): Promise<void> {
    if (this.isFlushing || !this.sender || this.queue.length === 0 || !this.isOnline) {
      return;
    }

    this.isFlushing = true;
    try {
      const itemsToFlush = [...this.queue];
      for (const item of itemsToFlush) {
        if (!this.isOnline) {
          break;
        }

        try {
          const success = await this.sender(item);
          if (success) {
            await this.dequeue(item.clientMutationId);
          } else {
            await this.markFailed(item.clientMutationId);
          }
        } catch {
          await this.markFailed(item.clientMutationId);
        }
      }
    } finally {
      this.isFlushing = false;
    }
  }

  public async clearQueue(): Promise<void> {
    this.queue = [];
    await AsyncStorage.removeItem(QUEUE_STORAGE_KEY);
  }

  public destroy(): void {
    if (this.unsubscribeNetInfo) {
      this.unsubscribeNetInfo();
      this.unsubscribeNetInfo = null;
    }
    this.isInitialized = false;
    OfflineQueueManager.instance = null;
  }

  private async persist(): Promise<void> {
    try {
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch {
      // Ignored
    }
  }
}
