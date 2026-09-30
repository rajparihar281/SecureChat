/// <reference types="jest" />

export const Platform = {
  OS: 'android',
  Version: 34,
  select: <T>(objs: { android?: T; ios?: T; default?: T }): T | undefined =>
    objs.android ?? objs.default,
};

if (typeof (globalThis as unknown as { WebSocket: unknown }).WebSocket === 'undefined') {
  class MockWebSocket {
    public static readonly CONNECTING = 0;
    public static readonly OPEN = 1;
    public static readonly CLOSING = 2;
    public static readonly CLOSED = 3;
    public readyState = 3;
    public onopen: (() => void) | null = null;
    public onclose: (() => void) | null = null;
    public onerror: (() => void) | null = null;
    public onmessage: (() => void) | null = null;
    public close(): void {}
    public send(): void {}
  }
  (globalThis as unknown as { WebSocket: unknown }).WebSocket = MockWebSocket;
}

export const PermissionsAndroid = {
  PERMISSIONS: {
    POST_NOTIFICATIONS: 'android.permission.POST_NOTIFICATIONS',
  },
  RESULTS: {
    GRANTED: 'granted',
    DENIED: 'denied',
    NEVER_ASK_AGAIN: 'never_ask_again',
  },
  request: jest.fn().mockResolvedValue('granted'),
  check: jest.fn().mockResolvedValue(true),
};

export const StyleSheet = {
  create: <T extends Record<string, unknown>>(styles: T): T => styles,
  flatten: <T extends Record<string, unknown>>(styles: unknown): T =>
    (Array.isArray(styles) ? Object.assign({}, ...styles) : (styles as T)) || ({} as T),
};

export const View = 'View';
export const Text = 'Text';
export const TextInput = 'TextInput';
export const TouchableOpacity = 'TouchableOpacity';
export const FlatList = 'FlatList';
export const ActivityIndicator = 'ActivityIndicator';
export const SafeAreaView = 'SafeAreaView';
export const RefreshControl = 'RefreshControl';
export const KeyboardAvoidingView = 'KeyboardAvoidingView';
export const ScrollView = 'ScrollView';
export const useColorScheme = (): 'dark' | 'light' => 'dark';

export const AppState = {
  currentState: 'active',
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
};

export const Animated = {
  Value: jest.fn().mockImplementation((val: number) => ({
    setValue: jest.fn(),
    interpolate: jest.fn(),
    _value: val,
  })),
  timing: jest.fn(() => ({
    start: jest.fn((cb?: () => void) => cb?.()),
    stop: jest.fn(),
  })),
  sequence: jest.fn(() => ({
    start: jest.fn((cb?: () => void) => cb?.()),
    stop: jest.fn(),
  })),
  loop: jest.fn(() => ({
    start: jest.fn(),
    stop: jest.fn(),
  })),
  delay: jest.fn(() => ({
    start: jest.fn(),
    stop: jest.fn(),
  })),
  View: 'View',
  Text: 'Text',
};

export const NativeModules: Record<string, unknown> = {
  SecureDocumentPicker: {
    pickDocument: jest.fn().mockResolvedValue({
      uri: 'content://com.android.providers.media.documents/document/101',
      fileName: 'secret_contract.pdf',
      mimeType: 'application/pdf',
      fileSize: 1048576,
    }),
  },
};

export default {
  Platform,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  RefreshControl,
  KeyboardAvoidingView,
  ScrollView,
  useColorScheme,
  AppState,
  Animated,
  PermissionsAndroid,
  NativeModules,
};
