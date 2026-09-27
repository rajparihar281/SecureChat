import admin from 'firebase-admin';

export interface NewMessageNotificationInput {
  recipientPushToken: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  messageId: string;
}

export class PushDispatcher {
  private static instance: PushDispatcher | null = null;
  private isInitialized = false;
  private isMockMode = true;

  public static getInstance(): PushDispatcher {
    if (!PushDispatcher.instance) {
      PushDispatcher.instance = new PushDispatcher();
    }
    return PushDispatcher.instance;
  }

  public initialize(): void {
    if (this.isInitialized) return;

    try {
      const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
      if (serviceAccountJson && !admin.apps.length) {
        const credentials = JSON.parse(serviceAccountJson);
        admin.initializeApp({
          credential: admin.credential.cert(credentials),
        });
        this.isMockMode = false;
      } else {
        this.isMockMode = true;
      }
    } catch {
      this.isMockMode = true;
    }

    this.isInitialized = true;
  }

  /**
   * Dispatches zero-plaintext push notification to the recipient device.
   * Enforces zero-knowledge: only sender metadata and conversation routing ID are sent.
   */
  public async sendNewMessageNotification(input: NewMessageNotificationInput): Promise<boolean> {
    if (!input.recipientPushToken) {
      return false;
    }

    if (this.isMockMode) {
      // In mock/test environment, successfully validate without network dispatch
      return true;
    }

    try {
      const message: admin.messaging.Message = {
        token: input.recipientPushToken,
        notification: {
          title: 'SecureChat',
          body: `New encrypted message from ${input.senderName}`,
        },
        data: {
          type: 'NEW_MESSAGE',
          conversationId: input.conversationId,
          senderId: input.senderId,
          senderName: input.senderName,
          messageId: input.messageId,
        },
        android: {
          priority: 'high',
          notification: {
            channelId: 'securechat_messages',
            priority: 'high',
            sound: 'default',
          },
        },
      };

      await admin.messaging().send(message);
      return true;
    } catch {
      return false;
    }
  }

  public setMockMode(enabled: boolean): void {
    this.isMockMode = enabled;
  }

  public getIsMockMode(): boolean {
    return this.isMockMode;
  }
}
