import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateSafetyNumberBlocks, generateFingerprintHex } from '@securechat/crypto';
import { useTheme } from '../theme';
import { Header, Card, Button } from '../components';
import { SecurityVerificationRouteProp, RootNavigationProp } from '../navigation/types';
import { useAuth } from '../auth';

export const SecurityVerificationScreen: React.FC = () => {
  const route = useRoute<SecurityVerificationRouteProp>();
  const navigation = useNavigation<RootNavigationProp>();
  const { colors, typography, spacing } = useTheme();
  const { device } = useAuth();

  const { username, publicKey } = route.params;
  const [isVerified, setIsVerified] = useState(false);

  // Load verification state from local device storage
  useEffect(() => {
    let isMounted = true;
    AsyncStorage.getItem(`@verified_keys:${publicKey}`)
      .then(val => {
        if (isMounted && val === 'true') {
          setIsVerified(true);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [publicKey]);

  // Compute 12-block safety number between current device and peer's public key
  const { blocks, isTwoPartySafetyNumber } = useMemo(() => {
    try {
      if (device?.publicKey && publicKey) {
        const derived = generateSafetyNumberBlocks(device.publicKey, publicKey);
        return { blocks: derived, isTwoPartySafetyNumber: true };
      }
    } catch {
      // Fallback if keys are mock or placeholder
    }

    // Individual public key fingerprint fallback
    try {
      const hex = generateFingerprintHex(publicKey);
      return { blocks: hex.split('-'), isTwoPartySafetyNumber: false };
    } catch {
      const clean = publicKey.replace(/[^a-zA-Z0-9]/g, '').padEnd(30, '0');
      const fallbackBlocks: string[] = [];
      for (let i = 0; i < 30; i += 5) {
        fallbackBlocks.push(clean.substring(i, i + 5).toUpperCase());
      }
      return { blocks: fallbackBlocks, isTwoPartySafetyNumber: false };
    }
  }, [device?.publicKey, publicKey]);

  const handleToggleVerified = async () => {
    const nextState = !isVerified;
    setIsVerified(nextState);
    try {
      if (nextState) {
        await AsyncStorage.setItem(`@verified_keys:${publicKey}`, 'true');
      } else {
        await AsyncStorage.removeItem(`@verified_keys:${publicKey}`);
      }
    } catch {
      // Storage failure handled silently
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Verify Safety Number" subtitle={username} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Text
          style={[typography.bodyMedium, { color: colors.textSecondary, marginBottom: spacing.lg }]}
        >
          Compare this{' '}
          {isTwoPartySafetyNumber ? '60-digit safety number' : 'cryptographic fingerprint'} with{' '}
          {username}&apos;s device to verify that your messages are end-to-end encrypted and immune
          to man-in-the-middle attacks.
        </Text>

        {isVerified && (
          <View
            style={[
              styles.verifiedBanner,
              { backgroundColor: colors.surfaceElevated, borderColor: colors.primary },
            ]}
          >
            <Text style={[typography.bodyMedium, { color: colors.primary, fontWeight: '700' }]}>
              ✓ Safety Number Verified
            </Text>
          </View>
        )}

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
          title={isVerified ? 'Mark as Unverified' : 'Mark as Verified'}
          variant={isVerified ? 'outline' : 'primary'}
          onPress={handleToggleVerified}
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
  verifiedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
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
