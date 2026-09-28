export const Platform = {
  OS: 'android',
  Version: 34,
  select: <T>(objs: { android?: T; ios?: T; default?: T }): T | undefined =>
    objs.android ?? objs.default,
};

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
};
