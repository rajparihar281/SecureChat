export interface ColorPalette {
  background: string;
  surface: string;
  surfaceElevated: string;
  surfaceHighlight: string;
  border: string;
  borderFocus: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  success: string;
  warning: string;
  error: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  bubbleIncoming: string;
  bubbleOutgoing: string;
  badgeUnread: string;
  verifiedKey: string;
}

export const darkPalette: ColorPalette = {
  background: '#0A0F1D',
  surface: '#121A2D',
  surfaceElevated: '#1A253D',
  surfaceHighlight: '#22304E',
  border: '#23324E',
  borderFocus: '#6366F1',
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  accent: '#06B6D4',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  textInverse: '#0F172A',
  bubbleIncoming: '#1A253D',
  bubbleOutgoing: '#4F46E5',
  badgeUnread: '#6366F1',
  verifiedKey: '#10B981',
};

export const lightPalette: ColorPalette = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceElevated: '#F1F5F9',
  surfaceHighlight: '#E2E8F0',
  border: '#E2E8F0',
  borderFocus: '#6366F1',
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  accent: '#0891B2',
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',
  bubbleIncoming: '#F1F5F9',
  bubbleOutgoing: '#6366F1',
  badgeUnread: '#6366F1',
  verifiedKey: '#059669',
};
