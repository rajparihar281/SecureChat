const defaultInstance = {
  requestPermission: jest.fn().mockResolvedValue(1),
  getToken: jest.fn().mockResolvedValue('mock_fcm_token_123'),
  onTokenRefresh: jest.fn().mockReturnValue(jest.fn()),
  onMessage: jest.fn().mockReturnValue(jest.fn()),
  onNotificationOpenedApp: jest.fn().mockReturnValue(jest.fn()),
  getInitialNotification: jest.fn().mockResolvedValue(null),
  setBackgroundMessageHandler: jest.fn(),
};

const mockMessaging = jest.fn(() => defaultInstance);

Object.assign(mockMessaging, {
  AuthorizationStatus: {
    NOT_DETERMINED: -1,
    DENIED: 0,
    AUTHORIZED: 1,
    PROVISIONAL: 2,
  },
});

export default mockMessaging;
