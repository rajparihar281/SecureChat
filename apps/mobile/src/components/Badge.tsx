import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme';

export interface BadgeProps {
  count?: number;
  label?: string;
  variant?: 'primary' | 'success' | 'warning' | 'error';
  style?: ViewStyle;
}

export const Badge: React.FC<BadgeProps> = ({ count, label, variant = 'primary', style }) => {
  const { colors, typography, spacing, borderRadius } = useTheme();

  const getBackgroundColor = () => {
    switch (variant) {
      case 'primary':
        return colors.badgeUnread;
      case 'success':
        return colors.success;
      case 'warning':
        return colors.warning;
      case 'error':
        return colors.error;
    }
  };

  const text = count !== undefined ? (count > 99 ? '99+' : count.toString()) : label;

  if (!text && text !== '0') return null;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: getBackgroundColor(),
          borderRadius: borderRadius.full,
          paddingHorizontal: spacing.xs * 1.5,
          paddingVertical: 2,
        },
        style,
      ]}
    >
      <Text
        style={[typography.caption, { color: colors.textPrimary, fontWeight: '700', fontSize: 10 }]}
      >
        {text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
