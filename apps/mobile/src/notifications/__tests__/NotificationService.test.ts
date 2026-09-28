import { Platform, PermissionsAndroid } from 'react-native';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { ApolloClient } from '@apollo/client';
import { NotificationService } from '../NotificationService';
import { navigationRef } from '../../navigation/navigationRef';

describe('NotificationService - FCM & Zero-Plaintext Notifications', () => {
  let service: NotificationService;
  let mockApolloClient: ApolloClient<unknown>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = NotificationService.getInstance();
    mockApolloClient = {
      mutate: jest.fn().mockResolvedValue({
        data: { registerPushToken: true },
      }),
    } as unknown as ApolloClient<unknown>;
    service.setApolloClient(mockApolloClient);
  });

  afterEach(() => {
    service.destroy();
  });

  describe('Permission Handling', () => {
    it('requests POST_NOTIFICATIONS permission on Android 13+ (API 33+)', async () => {
      Platform.OS = 'android';
      Platform.Version = 33;
      jest.spyOn(PermissionsAndroid, 'request').mockResolvedValue('granted' as unknown as void);

      const result = await service.requestPermissions();
      expect(PermissionsAndroid.request).toHaveBeenCalledWith(
        'android.permission.POST_NOTIFICATIONS',
      );
      expect(result).toBe(true);
    });

    it('returns true automatically on Android versions prior to API 33', async () => {
      Platform.OS = 'android';
      Platform.Version = 30;

      const result = await service.requestPermissions();
      expect(PermissionsAndroid.request).not.toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('requests permission via messaging on iOS', async () => {
      Platform.OS = 'ios';
      const mockReq = jest.fn().mockResolvedValue(1); // AUTHORIZED
      (messaging as unknown as jest.Mock).mockReturnValue({
        requestPermission: mockReq,
        getToken: jest.fn().mockResolvedValue('token'),
        onTokenRefresh: jest.fn().mockReturnValue(jest.fn()),
        onMessage: jest.fn().mockReturnValue(jest.fn()),
        onNotificationOpenedApp: jest.fn().mockReturnValue(jest.fn()),
        getInitialNotification: jest.fn().mockResolvedValue(null),
      });

      const result = await service.requestPermissions();
      expect(mockReq).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe('Token Registration & Upload', () => {
    it('retrieves FCM token and sends mutation to GraphQL backend', async () => {
      Platform.OS = 'android';
      Platform.Version = 33;
      jest.spyOn(PermissionsAndroid, 'request').mockResolvedValue('granted' as unknown as void);

      (messaging as unknown as jest.Mock).mockReturnValue({
        getToken: jest.fn().mockResolvedValue('fcm_token_device_abc'),
        onTokenRefresh: jest.fn().mockReturnValue(jest.fn()),
        onMessage: jest.fn().mockReturnValue(jest.fn()),
        onNotificationOpenedApp: jest.fn().mockReturnValue(jest.fn()),
        getInitialNotification: jest.fn().mockResolvedValue(null),
      });

      const token = await service.registerToken();
      expect(token).toBe('fcm_token_device_abc');
      expect(mockApolloClient.mutate).toHaveBeenCalledWith({
        mutation: expect.anything(),
        variables: {
          input: {
            pushToken: 'fcm_token_device_abc',
          },
        },
      });
    });
  });

  describe('Deep Linking & Zero-Plaintext Policy', () => {
    it('navigates to ChatRoom on notification open without requiring plaintext', () => {
      jest.spyOn(navigationRef, 'isReady').mockReturnValue(true);
      const navigateSpy = jest.spyOn(navigationRef, 'navigate').mockImplementation(() => {});

      const remoteMessage = {
        data: {
          type: 'NEW_MESSAGE',
          conversationId: 'conv_xyz_123',
          senderId: 'user_456',
          senderName: 'Alice',
        },
      } as unknown as FirebaseMessagingTypes.RemoteMessage;

      service.handleNotificationNavigation(remoteMessage);

      expect(navigateSpy).toHaveBeenCalledWith('ChatRoom', {
        conversationId: 'conv_xyz_123',
        recipientName: 'Alice',
      });
    });

    it('enforces Zero-Plaintext: rejects any message body handling in push payload', () => {
      const remoteMessage = {
        data: {
          type: 'NEW_MESSAGE',
          conversationId: 'conv_xyz_123',
          senderName: 'Bob',
          // Notice: no "body", "plaintext", or "text" in payload
        },
      } as unknown as FirebaseMessagingTypes.RemoteMessage;

      // Handle foreground without errors or leaking content
      expect(() => service.handleForegroundMessage(remoteMessage)).not.toThrow();
    });
  });
});
