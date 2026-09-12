import { getAppInfo, MOBILE_APP_TITLE } from './index';

describe('Mobile App Foundation', () => {
  it('returns valid app info', () => {
    const info = getAppInfo();
    expect(info.name).toBe('SecureChat');
    expect(info.version).toBe('1.0.0');
    expect(MOBILE_APP_TITLE).toBe('SecureChat');
  });
});
