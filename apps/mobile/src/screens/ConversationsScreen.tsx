import React, { useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Text,
  ListRenderItemInfo,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, NetworkStatus } from '@apollo/client';
import {
  GET_CONVERSATIONS_QUERY,
  GetConversationsQuery,
  GetConversationsQueryVariables,
  ConversationFieldsFragment,
} from '@securechat/shared';
import { useTheme } from '../theme';
import {
  Header,
  EmptyState,
  LoadingSpinner,
  ConversationRow,
  getConversationItemLayout,
} from '../components';
import { RootNavigationProp } from '../navigation/types';
import { useAuth } from '../auth';

export const ConversationsScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const { colors, typography, spacing } = useTheme();
  const { user } = useAuth();

  const { data, loading, networkStatus, refetch } = useQuery<
    GetConversationsQuery,
    GetConversationsQueryVariables
  >(GET_CONVERSATIONS_QUERY, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network',
  });

  const conversations = useMemo(
    () => (data?.conversations ? [...data.conversations] : []),
    [data?.conversations],
  );

  const handleConversationPress = useCallback(
    (conversation: ConversationFieldsFragment) => {
      const otherParticipant = conversation.participants.find(p => p.id !== user?.id);
      navigation.navigate('ChatRoom', {
        conversationId: conversation.id,
        recipientName: conversation.name || otherParticipant?.displayName || 'Encrypted Chat',
        recipientPublicKey: 'dummy_pub_key',
      });
    },
    [navigation, user?.id],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ConversationFieldsFragment>) => (
      <ConversationRow
        conversation={item}
        currentUserId={user?.id}
        onPress={handleConversationPress}
      />
    ),
    [handleConversationPress, user?.id],
  );

  const isRefreshing = networkStatus === NetworkStatus.refetch;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header
        title="SecureChat"
        rightAction={
          <TouchableOpacity
            onPress={() => navigation.navigate('Main', { screen: 'Contacts' } as never)}
            style={styles.headerAction}
          >
            <Text style={[typography.bodyMedium, { color: colors.primary, fontWeight: '600' }]}>
              + New
            </Text>
          </TouchableOpacity>
        }
      />

      {loading && !data?.conversations?.length ? (
        <LoadingSpinner message="Loading encrypted conversations..." />
      ) : conversations.length === 0 ? (
        <EmptyState
          icon="🔐"
          title="No Conversations Yet"
          description="Your messages are end-to-end encrypted. Start a conversation with a verified contact."
          actionTitle="Find Contacts"
          onAction={() => {
            navigation.navigate('Main', { screen: 'Contacts' } as never);
          }}
        />
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          getItemLayout={getConversationItemLayout}
          windowSize={10}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          removeClippedSubviews={true}
          initialNumToRender={15}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={() => {
                refetch().catch(() => {});
              }}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        />
      )}

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate('Main', { screen: 'Contacts' } as never)}
        style={[
          styles.fab,
          {
            backgroundColor: colors.primary,
            bottom: spacing.xl,
            right: spacing.xl,
          },
        ]}
      >
        <Text style={styles.fabIcon}>✏️</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerAction: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  fabIcon: {
    fontSize: 24,
  },
});
