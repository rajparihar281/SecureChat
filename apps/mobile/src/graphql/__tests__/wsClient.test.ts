import { Platform, AppState, AppStateStatus } from 'react-native';
import { getDefaultWsUrl, createWsLink } from '../wsClient';

// Mock graphql-ws
const mockDispose = jest.fn();
let lastClientOptions: {
  url?: string;
  connectionParams?: () => Promise<Record<string, string>>;
  on?: Record<string, () => void>;
} = {};

jest.mock('graphql-ws', () => ({
  createClient: jest.fn(
    (options: {
      url?: string;
      connectionParams?: () => Promise<Record<string, string>>;
      on?: Record<string, () => void>;
    }) => {
      lastClientOptions = options;
      return {
        dispose: mockDispose,
        subscribe: jest.fn(),
      };
    },
  ),
}));

describe('WebSocket Client & Subscriptions Link', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDefaultWsUrl', () => {
    it('returns Android emulator URL on android', () => {
      Platform.OS = 'android';
      expect(getDefaultWsUrl()).toBe('ws://10.0.2.2:4000/graphql');
    });

    it('returns localhost URL on ios', () => {
      Platform.OS = 'ios';
      expect(getDefaultWsUrl()).toBe('ws://localhost:4000/graphql');
    });
  });

  describe('createWsLink lifecycle and connection', () => {
    it('creates WsClient and GraphQLWsLink handle', () => {
      const handle = createWsLink({ wsUrl: 'ws://custom-domain:4000/graphql' });

      expect(handle).toBeDefined();
      expect(handle.wsLink).toBeDefined();
      expect(handle.getIsConnected()).toBe(false);

      // Trigger connected event callback
      lastClientOptions.on?.connected?.();
      expect(handle.getIsConnected()).toBe(true);

      // Trigger closed event
      lastClientOptions.on?.closed?.();
      expect(handle.getIsConnected()).toBe(false);
    });

    it('manages connection lifecycle on AppState change', () => {
      let appStateCallback: ((state: AppStateStatus) => void) | undefined;
      const removeMock = jest.fn();

      jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, callback) => {
        appStateCallback = callback as (state: AppStateStatus) => void;
        return { remove: removeMock } as unknown as ReturnType<typeof AppState.addEventListener>;
      });

      const handle = createWsLink();

      expect(AppState.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));

      // Background state disposes active socket
      appStateCallback?.('background');
      expect(mockDispose).toHaveBeenCalled();

      // Foreground state restores active
      appStateCallback?.('active');

      // Calling destroy unregisters AppState listener and disposes socket
      handle.destroy();
      expect(removeMock).toHaveBeenCalled();
    });

    it('populates connectionParams with Bearer token when token is present', async () => {
      const tokenProvider = {
        getAccessToken: jest.fn().mockResolvedValue('test_ws_token_123'),
        getRefreshToken: jest.fn().mockResolvedValue(null),
        refreshTokens: jest.fn().mockResolvedValue(null),
        onAuthFailure: jest.fn().mockResolvedValue(undefined),
      };

      createWsLink({ tokenProvider });

      const params = await lastClientOptions.connectionParams?.();
      expect(params).toEqual({
        authorization: 'Bearer test_ws_token_123',
      });
    });

    it('handles null token in connectionParams', async () => {
      const tokenProvider = {
        getAccessToken: jest.fn().mockResolvedValue(null),
        getRefreshToken: jest.fn().mockResolvedValue(null),
        refreshTokens: jest.fn().mockResolvedValue(null),
        onAuthFailure: jest.fn().mockResolvedValue(undefined),
      };

      createWsLink({ tokenProvider });

      const params = await lastClientOptions.connectionParams?.();
      expect(params).toEqual({});
    });
  });
});
