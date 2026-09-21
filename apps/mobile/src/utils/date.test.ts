import { formatMessageTime, formatRelativeTime } from './date';

describe('Date Utilities', () => {
  it('formats message time properly', () => {
    const iso = '2026-09-20T14:30:00Z';
    const formatted = formatMessageTime(iso);
    expect(formatted).toBeTruthy();
    expect(formatMessageTime(null)).toBe('');
  });

  it('formats relative time for recent messages', () => {
    const now = new Date();
    expect(formatRelativeTime(now.toISOString())).toBe('Just now');

    const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
    expect(formatRelativeTime(fiveMinAgo.toISOString())).toBe('5m');

    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    expect(formatRelativeTime(twoHoursAgo.toISOString())).toBe('2h');

    const yesterday = new Date(now.getTime() - 26 * 60 * 60 * 1000);
    expect(formatRelativeTime(yesterday.toISOString())).toBe('Yesterday');

    expect(formatRelativeTime(null)).toBe('');
  });
});
