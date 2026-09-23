const store = new Map<string, string>();

export const AsyncStorage = {
  setItem: jest.fn(async (key: string, value: string): Promise<void> => {
    store.set(key, value);
  }),
  getItem: jest.fn(async (key: string): Promise<string | null> => store.get(key) ?? null),
  removeItem: jest.fn(async (key: string): Promise<void> => {
    store.delete(key);
  }),
  clear: jest.fn(async (): Promise<void> => {
    store.clear();
  }),
  getAllKeys: jest.fn(async (): Promise<string[]> => Array.from(store.keys())),
};

export default AsyncStorage;
