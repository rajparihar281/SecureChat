import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme';
import { Header, Card, Button } from '../components';
import { SecurityVerificationRouteProp, RootNavigationProp } from '../navigation/types';

export const SecurityVerificationScreen: React.FC = () => {
  const route = useRoute<SecurityVerificationRouteProp>();
  const navigation = useNavigation<RootNavigationProp>();
  const { colors, typography, spacing } = useTheme();

  const { username, publicKey } = route.params;

  // Format public key into 6 blocks of 5 hex digits for easy visual comparison
  const formatFingerprint = (key: string): string[] => {
    const clean = key.replace(/[^a-zA-Z0-9]/g, '').padEnd(30, '0');
    const blocks: string[] = [];
    for (let i = 0; i < 30; i += 5) {
      blocks.push(clean.substring(i, i + 5).toUpperCase());
    }
    return blocks;
  };

  const blocks = formatFingerprint(publicKey);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Verify Safety Number" subtitle={username} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text
          style={[typography.bodyMedium, { color: colors.textSecondary, marginBottom: spacing.lg }]}
        >
          Compare this safety number with {username}'s device to verify that your messages are
          end-to-end encrypted and immune to man-in-the-middle attacks.
        </Text>

        <Card style={styles.fingerprintCard}>
          <Text style={styles.qrPlaceholder}>🏁 [QR Code Fingerprint]</Text>
          <View style={styles.fingerprintGrid}>
            {blocks.map((block, idx) => (
              <View
                key={idx}
                style={[styles.blockBox, { backgroundColor: colors.surfaceElevated }]}
              >
                <Text style={[typography.code, { color: colors.textPrimary, fontWeight: '700' }]}>
                  {block}
                </Text>
              </View>
            ))}
          </View>
        </Card>

        <Button
          title="Mark as Verified"
          variant="primary"
          onPress={() => navigation.goBack()}
          style={{ marginTop: spacing.xl }}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fingerprintCard: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  qrPlaceholder: {
    fontSize: 20,
    marginBottom: 20,
  },
  fingerprintGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  blockBox: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
});
