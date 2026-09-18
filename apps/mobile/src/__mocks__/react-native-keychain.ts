export const ACCESSIBLE = {
  WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'AccessibleWhenUnlockedThisDeviceOnly',
};

export const SECURITY_LEVEL = {
  SECURE_HARDWARE: 'SECURITY_LEVEL_SECURE_HARDWARE',
};

const mockStore = new Map<string, { username: string; password: string }>();

export const setGenericPassword = jest.fn(
  async (username: string, password: string, options?: { service?: string }): Promise<boolean> => {
    const service = options?.service ?? 'default';
    mockStore.set(service, { username, password });
    return true;
  },
);

export const getGenericPassword = jest.fn(
  async (options?: {
    service?: string;
  }): Promise<{ username: string; password: string } | false> => {
    const service = options?.service ?? 'default';
    const item = mockStore.get(service);
    return item ? { ...item } : false;
  },
);

export const resetGenericPassword = jest.fn(
  async (options?: { service?: string }): Promise<boolean> => {
    const service = options?.service ?? 'default';
    mockStore.delete(service);
    return true;
  },
);

export default {
  ACCESSIBLE,
  SECURITY_LEVEL,
  setGenericPassword,
  getGenericPassword,
  resetGenericPassword,
};
