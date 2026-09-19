import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useApolloClient } from '@apollo/client';
import {
  LOGIN_MUTATION,
  REGISTER_MUTATION,
  LoginMutation,
  LoginMutationVariables,
  RegisterMutation,
  RegisterMutationVariables,
  DevicePlatform,
  UserSummary,
} from '@securechat/shared';
import { SessionManager } from './SessionManager';
import { DeviceIdentity } from './keychain';

export interface AuthContextValue {
  user: UserSummary | null;
  device: DeviceIdentity | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { identifier: string; password: string }) => Promise<void>;
  register: (credentials: {
    username: string;
    email: string;
    password: string;
    displayName: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const client = useApolloClient();
  const sessionManager = useMemo(() => SessionManager.getInstance(), []);

  const [user, setUser] = useState<UserSummary | null>(sessionManager.getUser());
  const [device, setDevice] = useState<DeviceIdentity | null>(sessionManager.getDevice());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    sessionManager.getIsAuthenticated(),
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    sessionManager.setApolloClient(client);

    const unsubscribe = sessionManager.subscribe((authenticated, currentUser) => {
      setIsAuthenticated(authenticated);
      setUser(currentUser);
      setDevice(sessionManager.getDevice());
    });

    sessionManager.initialize().finally(() => {
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [client, sessionManager]);

  const login = useCallback(
    async (credentials: { identifier: string; password: string }) => {
      setIsLoading(true);
      try {
        const currentDevice = sessionManager.getDevice() || {
          deviceId: `dev_${Date.now()}`,
          deviceName: 'Android Device',
        };

        const result = await client.mutate<LoginMutation, LoginMutationVariables>({
          mutation: LOGIN_MUTATION,
          variables: {
            input: {
              identifier: credentials.identifier,
              password: credentials.password,
              deviceId: currentDevice.deviceId,
              deviceName: currentDevice.deviceName,
              platform: DevicePlatform.Android,
              publicKey: 'dummy_public_key_identity',
            },
          },
        });

        const authPayload = result.data?.login;
        if (!authPayload) {
          throw new Error('Login failed: invalid response from server');
        }

        const authenticatedUser: UserSummary = {
          id: authPayload.user.id,
          username: authPayload.user.username,
          displayName: authPayload.user.displayName,
          avatarUrl: authPayload.user.avatarUrl,
          createdAt: authPayload.user.createdAt,
        };

        const authenticatedDevice: DeviceIdentity = {
          deviceId: authPayload.device.deviceId,
          deviceName: authPayload.device.deviceName,
        };

        await sessionManager.saveSession(
          authenticatedUser,
          authenticatedDevice,
          authPayload.accessToken,
          authPayload.refreshToken,
        );
      } finally {
        setIsLoading(false);
      }
    },
    [client, sessionManager],
  );

  const register = useCallback(
    async (credentials: {
      username: string;
      email: string;
      password: string;
      displayName: string;
    }) => {
      setIsLoading(true);
      try {
        const currentDevice = sessionManager.getDevice() || {
          deviceId: `dev_${Date.now()}`,
          deviceName: 'Android Device',
        };

        const result = await client.mutate<RegisterMutation, RegisterMutationVariables>({
          mutation: REGISTER_MUTATION,
          variables: {
            input: {
              username: credentials.username,
              email: credentials.email,
              password: credentials.password,
              displayName: credentials.displayName,
              deviceId: currentDevice.deviceId,
              deviceName: currentDevice.deviceName,
              platform: DevicePlatform.Android,
              publicKey: 'dummy_public_key_identity',
            },
          },
        });

        const authPayload = result.data?.register;
        if (!authPayload) {
          throw new Error('Registration failed: invalid response from server');
        }

        const registeredUser: UserSummary = {
          id: authPayload.user.id,
          username: authPayload.user.username,
          displayName: authPayload.user.displayName,
          avatarUrl: authPayload.user.avatarUrl,
          createdAt: authPayload.user.createdAt,
        };

        const registeredDevice: DeviceIdentity = {
          deviceId: authPayload.device.deviceId,
          deviceName: authPayload.device.deviceName,
        };

        await sessionManager.saveSession(
          registeredUser,
          registeredDevice,
          authPayload.accessToken,
          authPayload.refreshToken,
        );
      } finally {
        setIsLoading(false);
      }
    },
    [client, sessionManager],
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await sessionManager.logout();
    } finally {
      setIsLoading(false);
    }
  }, [sessionManager]);

  const refresh = useCallback(async () => {
    return sessionManager.refreshTokens();
  }, [sessionManager]);

  const value = useMemo(
    () => ({
      user,
      device,
      isAuthenticated,
      isLoading,
      login,
      register,
      logout,
      refresh,
    }),
    [user, device, isAuthenticated, isLoading, login, register, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useSession(): AuthContextValue {
  return useAuth();
}
