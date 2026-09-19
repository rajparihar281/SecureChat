import { ApolloClient } from '@apollo/client';
import { SessionManager } from '../SessionManager';
import { setUseFallbackStore, clearMemoryFallback, saveTokens, getTokens } from '../keychain';

describe('SessionManager', () => {
  beforeEach(() => {
    setUseFallbackStore(true);
    clearMemoryFallback();
    SessionManager.resetInstance();
  });

  afterAll(() => {
    setUseFallbackStore(false);
  });

  it('initializes to unauthenticated when no tokens are stored', async () => {
    const manager = SessionManager.getInstance();
    const isAuth = await manager.initialize();

    expect(isAuth).toBe(false);
    expect(manager.getIsAuthenticated()).toBe(false);
    expect(manager.getUser()).toBeNull();
    expect(manager.getDevice()).toBeDefined();
    expect(manager.getDevice()?.deviceId).toMatch(/^dev_/);
  });

  it('initializes to authenticated when valid tokens are found', async () => {
    await saveTokens({
      accessToken: 'stored_acc_token',
      refreshToken: 'stored_ref_token',
    });

    const manager = SessionManager.getInstance();
    const isAuth = await manager.initialize();

    expect(isAuth).toBe(true);
    expect(manager.getIsAuthenticated()).toBe(true);
    expect(await manager.getAccessToken()).toBe('stored_acc_token');
    expect(await manager.getRefreshToken()).toBe('stored_ref_token');
  });

  it('saves session and notifies listeners', async () => {
    const manager = SessionManager.getInstance();
    await manager.initialize();

    const listener = jest.fn();
    const unsubscribe = manager.subscribe(listener);

    // Initial subscribe call
    expect(listener).toHaveBeenCalledWith(false, null);

    const testUser = {
      id: 'u-123',
      username: 'alice',
      displayName: 'Alice Wonderland',
      createdAt: '2026-09-18T10:00:00Z',
    };
    const testDevice = {
      deviceId: 'dev-456',
      deviceName: 'Pixel Test',
    };

    await manager.saveSession(testUser, testDevice, 'jwt_access', 'jwt_refresh');

    expect(manager.getIsAuthenticated()).toBe(true);
    expect(manager.getUser()).toEqual(testUser);
    expect(manager.getDevice()).toEqual(testDevice);
    expect(await manager.getAccessToken()).toBe('jwt_access');
    expect(await manager.getRefreshToken()).toBe('jwt_refresh');
    expect(listener).toHaveBeenCalledWith(true, testUser);

    unsubscribe();
  });

  it('logs out, clears secure storage and notifies listeners', async () => {
    const manager = SessionManager.getInstance();
    const mockApolloClient = {
      clearStore: jest.fn().mockResolvedValue(undefined),
      mutate: jest.fn(),
    } as unknown as ApolloClient<unknown>;
    manager.setApolloClient(mockApolloClient);

    await manager.saveSession(
      { id: 'u-1', username: 'bob', displayName: 'Bob', createdAt: '2026-09-18T10:00:00Z' },
      { deviceId: 'd-1', deviceName: 'Phone' },
      'acc',
      'ref',
    );

    const listener = jest.fn();
    manager.subscribe(listener);

    await manager.logout();

    expect(manager.getIsAuthenticated()).toBe(false);
    expect(manager.getUser()).toBeNull();
    expect(await getTokens()).toBeNull();
    expect(mockApolloClient.clearStore).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(false, null);
  });

  it('refreshes tokens via single-flight mutex', async () => {
    const manager = SessionManager.getInstance();
    await manager.saveSession(
      { id: 'u-1', username: 'carol', displayName: 'Carol', createdAt: '2026-09-18T10:00:00Z' },
      { deviceId: 'd-1', deviceName: 'Phone' },
      'old_acc',
      'valid_ref',
    );

    const mockApolloClient = {
      clearStore: jest.fn().mockResolvedValue(undefined),
      mutate: jest.fn().mockResolvedValue({
        data: {
          refreshToken: {
            accessToken: 'new_fresh_acc',
            refreshToken: 'new_fresh_ref',
            user: {
              id: 'u-1',
              username: 'carol',
              displayName: 'Carol',
              avatarUrl: null,
              createdAt: '2026-09-18T10:00:00Z',
            },
          },
        },
      }),
    } as unknown as ApolloClient<unknown>;
    manager.setApolloClient(mockApolloClient);

    // Call refreshTokens twice simultaneously to test single-flight mutex
    const [token1, token2] = await Promise.all([manager.refreshTokens(), manager.refreshTokens()]);

    expect(token1).toBe('new_fresh_acc');
    expect(token2).toBe('new_fresh_acc');
    // Only one network mutation should have occurred
    expect(mockApolloClient.mutate).toHaveBeenCalledTimes(1);
    expect(await manager.getAccessToken()).toBe('new_fresh_acc');
    expect(await manager.getRefreshToken()).toBe('new_fresh_ref');
  });

  it('handles refresh failure by logging out', async () => {
    const manager = SessionManager.getInstance();
    await manager.saveSession(
      { id: 'u-1', username: 'dave', displayName: 'Dave', createdAt: '2026-09-18T10:00:00Z' },
      { deviceId: 'd-1', deviceName: 'Phone' },
      'expired_acc',
      'expired_ref',
    );

    const mockApolloClient = {
      clearStore: jest.fn().mockResolvedValue(undefined),
      mutate: jest.fn().mockRejectedValue(new Error('Invalid refresh token')),
    } as unknown as ApolloClient<unknown>;
    manager.setApolloClient(mockApolloClient);

    const newToken = await manager.refreshTokens();

    expect(newToken).toBeNull();
    expect(manager.getIsAuthenticated()).toBe(false);
    expect(await getTokens()).toBeNull();
  });
});
