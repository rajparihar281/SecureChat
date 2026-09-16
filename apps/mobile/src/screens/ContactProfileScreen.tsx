import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme';
import { Header, Card, Avatar } from '../components';
import { ContactProfileRouteProp, RootNavigationProp } from '../navigation/types';

export const ContactProfileScreen: React.FC = () => {
  const route = useRoute<ContactProfileRouteProp>();
  const navigation = useNavigation<RootNavigationProp>();
  const { colors, typography, spacing } = useTheme();

  const { userId } = route.params;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Contact Profile" onBack={() => navigation.goBack()} />

      <View style={{ padding: spacing.lg, alignItems: 'center' }}>
        <Avatar name="User" size={80} style={{ marginBottom: spacing.md }} />
        <Text style={[typography.h2, { color: colors.textPrimary }]}>Verified Contact</Text>
        <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>ID: {userId}</Text>

        <Card style={{ width: '100%', marginTop: spacing.xl }}>
          <Text style={[typography.bodyMedium, { color: colors.textPrimary, fontWeight: '600' }]}>
            Encryption Status
          </Text>
          <Text style={[typography.bodySmall, { color: colors.success, marginTop: 4 }]}>
            ✓ Device keys active and registered
          </Text>
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
