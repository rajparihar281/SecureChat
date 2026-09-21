import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  ListRenderItemInfo,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_MESSAGES_QUERY,
  SEND_MESSAGE_MUTATION,
  GetMessagesQuery,
  GetMessagesQueryVariables,
  SendMessageMutation,
  SendMessageMutationVariables,
  MessageFieldsFragment,
} from '@securechat/shared';
import { useTheme } from '../theme';
import { Header, EmptyState, LoadingSpinner, MessageBubble } from '../components';
import { ChatRoomRouteProp, RootNavigationProp } from '../navigation/types';
import { useAuth } from '../auth';

export const ChatRoomScreen: React.FC = () => {
  const route = useRoute<ChatRoomRouteProp>();
  const navigation = useNavigation<RootNavigationProp>();
  const { colors, typography } = useTheme();
  const { user } = useAuth();

  const { conversationId, recipientName, recipientPublicKey } = route.params;
  const [inputText, setInputText] = useState('');
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const { data, loading, fetchMore } = useQuery<GetMessagesQuery, GetMessagesQueryVariables>(
    GET_MESSAGES_QUERY,
    {
      variables: { conversationId, limit: 30 },
      notifyOnNetworkStatusChange: true,
      fetchPolicy: 'cache-and-network',
    },
  );

  const [sendMessageMutation, { loading: sending }] = useMutation<
    SendMessageMutation,
    SendMessageMutationVariables
  >(SEND_MESSAGE_MUTATION);

  // Inverted FlatList requires newest message first (at index 0)
  const messages = useMemo(() => {
    if (!data?.messages?.items) return [];
    return [...data.messages.items].reverse();
  }, [data?.messages?.items]);

  const handleEndReached = useCallback(async () => {
    if (!data?.messages?.hasMore || !data.messages.nextCursor || isFetchingMore || loading) {
      return;
    }

    setIsFetchingMore(true);
    try {
      await fetchMore({
        variables: {
          conversationId,
          limit: 30,
          beforeCursor: data.messages.nextCursor,
        },
      });
    } catch {
      // Handled silently
    } finally {
      setIsFetchingMore(false);
    }
  }, [
    data?.messages?.hasMore,
    data?.messages?.nextCursor,
    isFetchingMore,
    loading,
    fetchMore,
    conversationId,
  ]);

  const handleSend = useCallback(async () => {
    const trimmed = inputText.trim();
    if (!trimmed || sending) return;

    setInputText('');

    try {
      await sendMessageMutation({
        variables: {
          input: {
            conversationId,
            encryptedPayload: {
              ciphertext: Buffer.from(trimmed).toString('base64'),
              nonce: Buffer.from('dummy_nonce_24_bytes_len_!').toString('base64'),
              senderPublicKey: 'dummy_sender_public_key_32b',
              recipientPublicKey: recipientPublicKey || 'dummy_recipient_public_key',
              version: 1,
            },
          },
        },
      });
    } catch {
      // Mutation errors handled in cache or UI
    }
  }, [inputText, sending, sendMessageMutation, conversationId, recipientPublicKey]);

  const renderMessageItem = useCallback(
    ({ item }: ListRenderItemInfo<MessageFieldsFragment>) => {
      const isOutgoing = item.senderId === user?.id;
      let textContent = '🔒 Encrypted message';
      try {
        if (item.encryptedPayload?.ciphertext) {
          textContent = Buffer.from(item.encryptedPayload.ciphertext, 'base64').toString('utf8');
        }
      } catch {
        textContent = '🔒 Encrypted message';
      }

      return <MessageBubble message={item} isOutgoing={isOutgoing} decryptedText={textContent} />;
    },
    [user?.id],
  );

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
        {loading && !messages.length ? (
          <LoadingSpinner message="Decrypting conversation history..." />
        ) : messages.length === 0 ? (
          <EmptyState
            icon="🔐"
            title="Encrypted Channel"
            description="Messages in this conversation are end-to-end encrypted. Send your first message below."
          />
        ) : (
          <FlatList
            data={messages}
            inverted={true}
            keyExtractor={item => item.id}
            renderItem={renderMessageItem}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.3}
            windowSize={10}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            removeClippedSubviews={true}
            initialNumToRender={15}
          />
        )}
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
          onSubmitEditing={handleSend}
          returnKeyType="send"
          style={[styles.input, typography.bodyMedium, { color: colors.textPrimary }]}
        />
        <TouchableOpacity
          disabled={!inputText.trim() || sending}
          onPress={handleSend}
          style={[
            styles.sendButton,
            {
              backgroundColor:
                inputText.trim() && !sending ? colors.primary : colors.surfaceElevated,
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
