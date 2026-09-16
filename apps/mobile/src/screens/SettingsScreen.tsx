import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../theme';
import { Header, Card, Badge } from '../components';

export const SettingsScreen: React.FC = () => {
  const { colors, typography, spacing, mode, setMode } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Settings" />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text
          style={[
            typography.caption,
            { color: colors.textSecondary, marginBottom: spacing.sm, textTransform: 'uppercase' },
          ]}
        >
          Security & Keys
        </Text>

        <Card style={{ marginBottom: spacing.xl }}>
          <View style={styles.row}>
            <View>
              <Text
                style={[typography.bodyLarge, { color: colors.textPrimary, fontWeight: '600' }]}
              >
                End-to-End Encryption
              </Text>
              <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
                X25519 & XChaCha20-Poly1305
              </Text>
            </View>
            <Badge label="ACTIVE" variant="success" />
          </View>
        </Card>

        <Text
          style={[
            typography.caption,
            { color: colors.textSecondary, marginBottom: spacing.sm, textTransform: 'uppercase' },
          ]}
        >
          Appearance
        </Text>

        <Card style={{ marginBottom: spacing.xl }}>
          <View style={styles.themeRow}>
            {(['dark', 'light', 'system'] as const).map(m => (
              <TouchableOpacity
                key={m}
                onPress={() => setMode(m)}
                style={[
                  styles.modeButton,
                  {
                    backgroundColor: mode === m ? colors.primary : colors.surfaceElevated,
                  },
                ]}
              >
                <Text
                  style={[
                    typography.bodySmall,
                    {
                      color: mode === m ? colors.textPrimary : colors.textSecondary,
                      fontWeight: '600',
                      textTransform: 'capitalize',
                    },
                  ]}
                >
                  {m}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Text
          style={[
            typography.caption,
            { color: colors.textSecondary, marginBottom: spacing.sm, textTransform: 'uppercase' },
          ]}
        >
          About
        </Text>
        <Card>
          <Text style={[typography.bodyMedium, { color: colors.textPrimary }]}>
            SecureChat Mobile
          </Text>
          <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: 4 }]}>
            Version 1.0.0 (Bare React Native + Keystore E2EE)
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
});
