import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../theme';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '💬',
  title,
  description,
  actionTitle,
  onAction,
  style,
}) => {
  const { colors, typography, spacing } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[typography.h2, { color: colors.textPrimary, marginTop: spacing.md }]}>
        {title}
      </Text>
      <Text
        style={[
          typography.bodyMedium,
          {
            color: colors.textSecondary,
            textAlign: 'center',
            marginTop: spacing.sm,
            maxWidth: 300,
          },
        ]}
      >
        {description}
      </Text>

      {actionTitle && onAction ? (
        <Button
          title={actionTitle}
          onPress={onAction}
          style={{ marginTop: spacing.xl, minWidth: 160 }}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  icon: {
    fontSize: 56,
  },
});
