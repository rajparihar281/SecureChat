import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme';
import { Button, Input, Card } from '../components';
import { AuthNavigationProp } from '../navigation/types';
import { useAuth } from '../auth';

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<AuthNavigationProp>();
  const { colors, typography, spacing } = useTheme();
  const { register } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password || !displayName.trim()) {
      setError('Please fill in all registration fields');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await register({ username, email, password, displayName });
    } catch (err) {
      setError((err as Error).message || 'Failed to register');
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
          <Text style={[typography.h1, { color: colors.textPrimary }]}>Create Account</Text>
          <Text
            style={[typography.bodyMedium, { color: colors.textSecondary, marginTop: spacing.xs }]}
          >
            Generate your cryptographic identity keypair
          </Text>
        </View>

        <Card style={styles.card}>
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
            label="Display Name"
            placeholder="Alice Wonderland"
            value={displayName}
            onChangeText={setDisplayName}
          />

          <Input
            label="Username"
            placeholder="alice"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Input
            label="Email"
            placeholder="alice@securechat.io"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Password"
            placeholder="Minimum 8 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button
            title="Create Encrypted Account"
            onPress={handleRegister}
            loading={loading}
            style={{ marginTop: spacing.sm }}
          />

          <Button
            title="Already have an account? Log in"
            variant="ghost"
            onPress={() => navigation.navigate('Login')}
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
    marginBottom: 24,
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
