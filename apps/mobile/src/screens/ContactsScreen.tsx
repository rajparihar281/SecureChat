import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ListRenderItemInfo,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation } from '@apollo/client';
import {
  GET_USERS_QUERY,
  CREATE_CONVERSATION_MUTATION,
  GetUsersQuery,
  GetUsersQueryVariables,
  CreateConversationMutation,
  CreateConversationMutationVariables,
  UserFieldsFragment,
} from '@securechat/shared';
import { useTheme } from '../theme';
import { Header, Avatar, LoadingSpinner, EmptyState } from '../components';
import { RootNavigationProp } from '../navigation/types';
import { useAuth } from '../auth';

export const ContactsScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const { colors, typography, spacing } = useTheme();
  const { user } = useAuth();

  const [search, setSearch] = useState('');

  const { data, loading } = useQuery<GetUsersQuery, GetUsersQueryVariables>(GET_USERS_QUERY, {
    variables: { query: search.trim() || undefined },
    fetchPolicy: 'cache-and-network',
  });

  const [createConversationMutation, { loading: creating }] = useMutation<
    CreateConversationMutation,
    CreateConversationMutationVariables
  >(CREATE_CONVERSATION_MUTATION);

  const handleSelectContact = useCallback(
    async (contact: UserFieldsFragment) => {
      if (creating) return;

      try {
        const result = await createConversationMutation({
          variables: {
            input: {
              participantIds: [contact.id],
              isGroup: false,
            },
          },
        });

        const conversation = result.data?.createConversation;
        if (conversation) {
          navigation.navigate('ChatRoom', {
            conversationId: conversation.id,
            recipientName: contact.displayName,
            recipientPublicKey: 'dummy_contact_pub_key',
          });
        }
      } catch {
        // Handled silently
      }
    },
    [creating, createConversationMutation, navigation],
  );

  const filteredUsers = (data?.users || []).filter(u => u.id !== user?.id);

  const renderContactItem = useCallback(
    ({ item }: ListRenderItemInfo<UserFieldsFragment>) => (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => handleSelectContact(item)}
        style={[
          styles.contactRow,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            paddingHorizontal: spacing.lg,
          },
        ]}
      >
        <Avatar name={item.displayName} size={48} />
        <View style={[styles.contactInfo, { marginLeft: spacing.md }]}>
          <Text
            style={[typography.bodyLarge, { color: colors.textPrimary, fontWeight: '600' }]}
            numberOfLines={1}
          >
            {item.displayName}
          </Text>
          <Text style={[typography.bodySmall, { color: colors.textSecondary }]}>
            @{item.username}
          </Text>
        </View>
        <Text style={[typography.caption, { color: colors.primary, fontWeight: '600' }]}>
          Chat →
        </Text>
      </TouchableOpacity>
    ),
    [handleSelectContact, colors, typography, spacing],
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Contacts" />

      <View
        style={[styles.searchContainer, { backgroundColor: colors.surface, margin: spacing.md }]}
      >
        <Text style={{ marginRight: 8 }}>🔍</Text>
        <TextInput
          placeholder="Search by username or name..."
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
          style={[styles.searchInput, typography.bodyMedium, { color: colors.textPrimary }]}
        />
        {search.length > 0 ? (
          <TouchableOpacity onPress={() => setSearch('')} style={{ padding: 4 }}>
            <Text style={{ color: colors.textMuted }}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {loading && !filteredUsers.length ? (
        <LoadingSpinner message="Searching contacts directory..." />
      ) : filteredUsers.length === 0 ? (
        <EmptyState
          icon="👥"
          title="No Contacts Found"
          description={
            search
              ? `No user matches "${search}". Try searching for another username.`
              : 'Start typing a username to discover other encrypted users on the network.'
          }
        />
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={item => item.id}
          renderItem={renderContactItem}
          windowSize={10}
          maxToRenderPerBatch={10}
          initialNumToRender={15}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 4,
  },
  contactRow: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  contactInfo: {
    flex: 1,
    justifyContent: 'center',
  },
});
