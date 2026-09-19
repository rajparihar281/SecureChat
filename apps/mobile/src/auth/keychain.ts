import * as Keychain from 'react-native-keychain';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface DeviceIdentity {
  deviceId: string;
  deviceName: string;
}

const AUTH_SERVICE = 'com.securechat.auth_tokens';
const DEVICE_SERVICE = 'com.securechat.device_identity';

// In-memory fallback for test and non-native environments
const memoryFallbackStore = new Map<string, string>();

let useFallbackStore = false;

export function setUseFallbackStore(enabled: boolean): void {
  useFallbackStore = enabled;
}

export function clearMemoryFallback(): void {
  memoryFallbackStore.clear();
}

export async function saveTokens(tokens: AuthTokens): Promise<boolean> {
  const payload = JSON.stringify(tokens);
  if (useFallbackStore) {
    memoryFallbackStore.set(AUTH_SERVICE, payload);
    return true;
  }

  try {
    const result = await Keychain.setGenericPassword('auth_tokens', payload, {
      service: AUTH_SERVICE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      securityLevel: Keychain.SECURITY_LEVEL.SECURE_HARDWARE,
    });
    return !!result;
  } catch {
    // Graceful fallback to memory store
    memoryFallbackStore.set(AUTH_SERVICE, payload);
    return true;
  }
}

export async function getTokens(): Promise<AuthTokens | null> {
  if (useFallbackStore) {
    const stored = memoryFallbackStore.get(AUTH_SERVICE);
    if (!stored) {
      return null;
    }
    try {
      return JSON.parse(stored) as AuthTokens;
    } catch {
      return null;
    }
  }

  try {
    const credentials = await Keychain.getGenericPassword({
      service: AUTH_SERVICE,
    });

    if (credentials && credentials.password) {
      return JSON.parse(credentials.password) as AuthTokens;
    }

    const fallback = memoryFallbackStore.get(AUTH_SERVICE);
    return fallback ? (JSON.parse(fallback) as AuthTokens) : null;
  } catch {
    const fallback = memoryFallbackStore.get(AUTH_SERVICE);
    return fallback ? (JSON.parse(fallback) as AuthTokens) : null;
  }
}

export async function clearTokens(): Promise<boolean> {
  memoryFallbackStore.delete(AUTH_SERVICE);
  if (useFallbackStore) {
    return true;
  }

  try {
    return await Keychain.resetGenericPassword({
      service: AUTH_SERVICE,
    });
  } catch {
    return true;
  }
}

export async function saveDeviceIdentity(identity: DeviceIdentity): Promise<boolean> {
  const payload = JSON.stringify(identity);
  if (useFallbackStore) {
    memoryFallbackStore.set(DEVICE_SERVICE, payload);
    return true;
  }

  try {
    const result = await Keychain.setGenericPassword('device_identity', payload, {
      service: DEVICE_SERVICE,
      accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
    return !!result;
  } catch {
    memoryFallbackStore.set(DEVICE_SERVICE, payload);
    return true;
  }
}

export async function getDeviceIdentity(): Promise<DeviceIdentity | null> {
  if (useFallbackStore) {
    const stored = memoryFallbackStore.get(DEVICE_SERVICE);
    if (!stored) {
      return null;
    }
    try {
      return JSON.parse(stored) as DeviceIdentity;
    } catch {
      return null;
    }
  }

  try {
    const credentials = await Keychain.getGenericPassword({
      service: DEVICE_SERVICE,
    });

    if (credentials && credentials.password) {
      return JSON.parse(credentials.password) as DeviceIdentity;
    }

    const fallback = memoryFallbackStore.get(DEVICE_SERVICE);
    return fallback ? (JSON.parse(fallback) as DeviceIdentity) : null;
  } catch {
    const fallback = memoryFallbackStore.get(DEVICE_SERVICE);
    return fallback ? (JSON.parse(fallback) as DeviceIdentity) : null;
  }
}

export async function clearAllSecureStorage(): Promise<void> {
  await clearTokens();
  memoryFallbackStore.delete(DEVICE_SERVICE);
  if (!useFallbackStore) {
    try {
      await Keychain.resetGenericPassword({
        service: DEVICE_SERVICE,
      });
    } catch {
      // Ignored
    }
  }
}
