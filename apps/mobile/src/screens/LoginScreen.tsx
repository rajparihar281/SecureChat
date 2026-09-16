import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme';
import { Button, Input, Card } from '../components';
import { AuthNavigationProp } from '../navigation/types';

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<AuthNavigationProp>();
  const { colors, typography, spacing } = useTheme();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!identifier.trim() || !password) {
      setError('Please enter your username/email and password');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      // Auth integration hooked up in Phase 5
    } catch (err) {
      setError((err as Error).message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.logoBadge}>🔒</Text>
          <Text style={[typography.h1, { color: colors.textPrimary, marginTop: spacing.md }]}>
            SecureChat
          </Text>
          <Text
            style={[typography.bodyMedium, { color: colors.textSecondary, marginTop: spacing.xs }]}
          >
            End-to-End Encrypted Private Messaging
          </Text>
        </View>

        <Card style={styles.card}>
          <Text style={[typography.h2, { color: colors.textPrimary, marginBottom: spacing.lg }]}>
            Welcome Back
          </Text>

          {error ? (
            <View
              style={[
                styles.errorBox,
                { backgroundColor: `${colors.error}22`, borderColor: colors.error },
              ]}
            >
              <Text style={[typography.bodySmall, { color: colors.error }]}>{error}</Text>
            </View>
          ) : null}

          <Input
            label="Username or Email"
            placeholder="alice or alice@securechat.io"
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label="Password"
            placeholder="••••••••••••"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button
            title="Log In"
            onPress={handleLogin}
            loading={loading}
            style={{ marginTop: spacing.sm }}
          />

          <Button
            title="Create an account"
            variant="ghost"
            onPress={() => navigation.navigate('Register')}
            style={{ marginTop: spacing.sm }}
          />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBadge: {
    fontSize: 52,
  },
  card: {
    width: '100%',
  },
  errorBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
  },
});
