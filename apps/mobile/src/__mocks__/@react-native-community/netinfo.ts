export interface NetInfoState {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
}

type NetInfoListener = (state: NetInfoState) => void;

const listeners = new Set<NetInfoListener>();
let currentState: NetInfoState = { isConnected: true, isInternetReachable: true };

export const NetInfo = {
  addEventListener: jest.fn((listener: NetInfoListener) => {
    listeners.add(listener);
    listener(currentState);
    return () => listeners.delete(listener);
  }),
  fetch: jest.fn(async (): Promise<NetInfoState> => currentState),
  __simulateNetworkChange: (isConnected: boolean, isInternetReachable = isConnected): void => {
    currentState = { isConnected, isInternetReachable };
    for (const listener of listeners) {
      listener(currentState);
    }
  },
  __resetListeners: (): void => {
    listeners.clear();
    currentState = { isConnected: true, isInternetReachable: true };
  },
};

export default NetInfo;
