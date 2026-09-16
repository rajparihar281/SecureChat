import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme';
import { Header, EmptyState } from '../components';
import { ChatRoomRouteProp, RootNavigationProp } from '../navigation/types';

export const ChatRoomScreen: React.FC = () => {
  const route = useRoute<ChatRoomRouteProp>();
  const navigation = useNavigation<RootNavigationProp>();
  const { colors, typography } = useTheme();

  const { recipientName, recipientPublicKey } = route.params;
  const [inputText, setInputText] = useState('');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Header
        title={recipientName}
        subtitle="🔒 End-to-End Encrypted"
        onBack={() => navigation.goBack()}
        rightAction={
          recipientPublicKey ? (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('SecurityVerification', {
                  userId: 'recipient',
                  username: recipientName,
                  publicKey: recipientPublicKey,
                })
              }
              style={{ padding: 6 }}
            >
              <Text style={{ fontSize: 18 }}>🛡️</Text>
            </TouchableOpacity>
          ) : null
        }
      />

      <View style={styles.messagesContainer}>
        <EmptyState
          icon="🔐"
          title="Encrypted Channel"
          description="Messages to this conversation are secured with XChaCha20-Poly1305. Nobody outside this chat, not even SecureChat, can read them."
        />
      </View>

      <View
        style={[
          styles.inputBar,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
        ]}
      >
        <TextInput
          placeholder="Encrypted message..."
          placeholderTextColor={colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          style={[styles.input, typography.bodyMedium, { color: colors.textPrimary }]}
        />
        <TouchableOpacity
          disabled={!inputText.trim()}
          style={[
            styles.sendButton,
            {
              backgroundColor: inputText.trim() ? colors.primary : colors.surfaceElevated,
            },
          ]}
        >
          <Text style={{ color: colors.textPrimary, fontWeight: '700' }}>↑</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 40,
    paddingHorizontal: 12,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
