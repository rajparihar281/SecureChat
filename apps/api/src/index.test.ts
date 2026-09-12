import { getApiStatus } from './index';

describe('API Foundation', () => {
  it('returns healthy status and app name', () => {
    const status = getApiStatus();
    expect(status.status).toBe('healthy');
    expect(status.app).toBe('SecureChat');
  });
});
