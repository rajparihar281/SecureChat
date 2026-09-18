import { ApolloClient } from '@apollo/client';
import {
  REFRESH_TOKEN_MUTATION,
  RefreshTokenMutation,
  RefreshTokenMutationVariables,
  UserSummary,
} from '@securechat/shared';
import {
  saveTokens,
  getTokens,
  clearTokens,
  saveDeviceIdentity,
  getDeviceIdentity,
  DeviceIdentity,
} from './keychain';
import { TokenProvider } from '../graphql/client';

export type SessionStateListener = (isAuthenticated: boolean, user: UserSummary | null) => void;

export class SessionManager implements TokenProvider {
  private static instance: SessionManager | null = null;

  private user: UserSummary | null = null;
  private device: DeviceIdentity | null = null;
  private isAuthenticated = false;
  private isInitialized = false;

  private activeRefreshPromise: Promise<string | null> | null = null;
  private listeners: Set<SessionStateListener> = new Set();
  private apolloClient: ApolloClient<unknown> | null = null;

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    return SessionManager.instance;
  }

  public setApolloClient(client: ApolloClient<unknown>): void {
    this.apolloClient = client;
  }

  public async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return this.isAuthenticated;
    }

    try {
      // Load or generate device identity
      let currentDevice = await getDeviceIdentity();
      if (!currentDevice) {
        currentDevice = {
          deviceId: `dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          deviceName: 'Android Device',
        };
        await saveDeviceIdentity(currentDevice);
      }
      this.device = currentDevice;

      // Check stored tokens
      const tokens = await getTokens();
      if (tokens?.accessToken && tokens?.refreshToken) {
        this.isAuthenticated = true;
      } else {
        this.isAuthenticated = false;
      }
    } catch {
      this.isAuthenticated = false;
    } finally {
      this.isInitialized = true;
      this.notifyListeners();
    }

    return this.isAuthenticated;
  }

  public async getAccessToken(): Promise<string | null> {
    const tokens = await getTokens();
    return tokens?.accessToken ?? null;
  }

  public async getRefreshToken(): Promise<string | null> {
    const tokens = await getTokens();
    return tokens?.refreshToken ?? null;
  }

  public async refreshTokens(): Promise<string | null> {
    if (this.activeRefreshPromise) {
      return this.activeRefreshPromise;
    }

    this.activeRefreshPromise = (async () => {
      try {
        const currentRefreshToken = await this.getRefreshToken();
        if (!currentRefreshToken) {
          await this.logout();
          return null;
        }

        if (!this.apolloClient) {
          return null;
        }

        const response = await this.apolloClient.mutate<
          RefreshTokenMutation,
          RefreshTokenMutationVariables
        >({
          mutation: REFRESH_TOKEN_MUTATION,
          variables: {
            input: { refreshToken: currentRefreshToken },
          },
          fetchPolicy: 'no-cache',
        });

        const authPayload = response.data?.refreshToken;
        if (!authPayload) {
          await this.logout();
          return null;
        }

        await saveTokens({
          accessToken: authPayload.accessToken,
          refreshToken: authPayload.refreshToken,
        });

        this.user = {
          id: authPayload.user.id,
          username: authPayload.user.username,
          displayName: authPayload.user.displayName,
          avatarUrl: authPayload.user.avatarUrl,
          createdAt: authPayload.user.createdAt,
        };

        this.isAuthenticated = true;
        this.notifyListeners();
        return authPayload.accessToken;
      } catch {
        await this.logout();
        return null;
      } finally {
        this.activeRefreshPromise = null;
      }
    })();

    return this.activeRefreshPromise;
  }

  public async onAuthFailure(): Promise<void> {
    await this.logout();
  }

  public async saveSession(
    user: UserSummary,
    device: DeviceIdentity,
    accessToken: string,
    refreshToken: string,
  ): Promise<void> {
    this.user = user;
    this.device = device;
    this.isAuthenticated = true;

    await saveTokens({ accessToken, refreshToken });
    await saveDeviceIdentity(device);

    this.notifyListeners();
  }

  public async logout(): Promise<void> {
    this.user = null;
    this.isAuthenticated = false;

    await clearTokens();

    if (this.apolloClient) {
      try {
        await this.apolloClient.clearStore();
      } catch {
        // Ignored
      }
    }

    this.notifyListeners();
  }

  public getUser(): UserSummary | null {
    return this.user;
  }

  public getDevice(): DeviceIdentity | null {
    return this.device;
  }

  public getIsAuthenticated(): boolean {
    return this.isAuthenticated;
  }

  public subscribe(listener: SessionStateListener): () => void {
    this.listeners.add(listener);
    listener(this.isAuthenticated, this.user);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.isAuthenticated, this.user);
    }
  }

  // Reset for testing purposes
  public static resetInstance(): void {
    SessionManager.instance = null;
  }
}
