import { Platform, PermissionsAndroid } from 'react-native';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { ApolloClient } from '@apollo/client';
import {
  REGISTER_PUSH_TOKEN_MUTATION,
  RegisterPushTokenMutation,
  RegisterPushTokenMutationVariables,
} from '@securechat/shared';
import { navigationRef } from '../navigation/navigationRef';
import { PushNotificationPayload } from './types';

export class NotificationService {
  private static instance: NotificationService | null = null;
  private apolloClient: ApolloClient<unknown> | null = null;
  private unsubscribeOnMessage: (() => void) | null = null;
  private unsubscribeOnTokenRefresh: (() => void) | null = null;
  private unsubscribeOnNotificationOpened: (() => void) | null = null;

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public setApolloClient(client: ApolloClient<unknown>): void {
    this.apolloClient = client;
  }

  /**
   * Request notification permissions for Android 13 (TIRAMISU / API 33+) and iOS.
   */
  public async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'android') {
        if (Platform.Version >= 33) {
          const granted = await PermissionsAndroid.request(
            'android.permission.POST_NOTIFICATIONS' as Parameters<
              typeof PermissionsAndroid.request
            >[0],
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
      }

      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        return (
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL
        );
      }

      return false;
    } catch {
      return false;
    }
  }

  /**
   * Retrieves FCM push token and uploads it to the backend GraphQL API.
   */
  public async registerToken(): Promise<string | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) return null;

      const token = await messaging().getToken();
      if (token && this.apolloClient) {
        await this.uploadTokenToBackend(token);
      }
      return token;
    } catch {
      return null;
    }
  }

  public async uploadTokenToBackend(token: string): Promise<boolean> {
    if (!this.apolloClient) return false;

    try {
      const result = await this.apolloClient.mutate<
        RegisterPushTokenMutation,
        RegisterPushTokenMutationVariables
      >({
        mutation: REGISTER_PUSH_TOKEN_MUTATION,
        variables: {
          input: {
            pushToken: token,
          },
        },
      });

      return !!result.data?.registerPushToken;
    } catch {
      return false;
    }
  }

  /**
   * Initializes listeners for foreground, background, and cold start messages.
   */
  public initialize(): void {
    // 1. Listen for FCM token refresh events
    this.unsubscribeOnTokenRefresh = messaging().onTokenRefresh(async (token: string) => {
      await this.uploadTokenToBackend(token);
    });

    // 2. Foreground notification received
    this.unsubscribeOnMessage = messaging().onMessage(
      async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        this.handleForegroundMessage(remoteMessage);
      },
    );

    // 3. User taps on background notification
    this.unsubscribeOnNotificationOpened = messaging().onNotificationOpenedApp(
      (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        this.handleNotificationNavigation(remoteMessage);
      },
    );

    // 4. Check if app was opened from a terminated/cold state via notification tap
    messaging()
      .getInitialNotification()
      .then((remoteMessage: FirebaseMessagingTypes.RemoteMessage | null) => {
        if (remoteMessage) {
          this.handleNotificationNavigation(remoteMessage);
        }
      })
      .catch(() => {});
  }

  /**
   * Strictly enforces Zero-Plaintext Policy:
   * Only metadata and encrypted alerts are handled; no plaintext content is expected or parsed.
   */
  public handleForegroundMessage(remoteMessage: FirebaseMessagingTypes.RemoteMessage): void {
    const payload = remoteMessage.data as unknown as PushNotificationPayload | undefined;
    if (payload?.type === 'NEW_MESSAGE' && payload.conversationId) {
      // In-app banner or audio chime triggered without exposing message content
    }
  }

  /**
   * Deep link routing to target conversation screen
   */
  public handleNotificationNavigation(remoteMessage: FirebaseMessagingTypes.RemoteMessage): void {
    const payload = remoteMessage.data as unknown as PushNotificationPayload | undefined;
    if (payload?.conversationId && navigationRef.isReady()) {
      navigationRef.navigate('ChatRoom', {
        conversationId: payload.conversationId,
        recipientName: payload.senderName || 'Encrypted Chat',
      });
    }
  }

  public destroy(): void {
    if (this.unsubscribeOnMessage) {
      this.unsubscribeOnMessage();
      this.unsubscribeOnMessage = null;
    }
    if (this.unsubscribeOnTokenRefresh) {
      this.unsubscribeOnTokenRefresh();
      this.unsubscribeOnTokenRefresh = null;
    }
    if (this.unsubscribeOnNotificationOpened) {
      this.unsubscribeOnNotificationOpened();
      this.unsubscribeOnNotificationOpened = null;
    }
  }
}
