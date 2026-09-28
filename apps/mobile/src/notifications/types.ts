export type PushNotificationType = 'NEW_MESSAGE' | 'KEY_VERIFICATION' | 'SYSTEM_ALERT';

export interface PushNotificationPayload {
  type: PushNotificationType;
  conversationId?: string;
  senderId?: string;
  senderName?: string;
  clientMutationId?: string;
  messageId?: string;
}
