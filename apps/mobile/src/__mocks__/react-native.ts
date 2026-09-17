export const Platform = {
  OS: 'android',
  select: <T>(objs: { android?: T; ios?: T; default?: T }): T | undefined =>
    objs.android ?? objs.default,
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
export const AppState = {
  currentState: 'active',
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
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
  AppState,
};
