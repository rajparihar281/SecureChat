import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ConversationFieldsFragment } from '@securechat/shared';
import { useTheme } from '../theme';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { formatRelativeTime } from '../utils/date';

export const CONVERSATION_ROW_HEIGHT = 76;

export const getConversationItemLayout = (
  _: unknown,
  index: number,
): { length: number; offset: number; index: number } => ({
  length: CONVERSATION_ROW_HEIGHT,
  offset: CONVERSATION_ROW_HEIGHT * index,
  index,
});

export interface ConversationRowProps {
  conversation: ConversationFieldsFragment;
  currentUserId?: string | null;
  onPress: (conversation: ConversationFieldsFragment) => void;
}

export const ConversationRow: React.FC<ConversationRowProps> = React.memo(
  ({ conversation, currentUserId, onPress }) => {
    const { colors, typography, spacing } = useTheme();

    const otherParticipant = useMemo(() => {
      if (conversation.isGroup) return null;
      return (
        conversation.participants.find(p => p.id !== currentUserId) ??
        conversation.participants[0] ??
        null
      );
    }, [conversation.participants, conversation.isGroup, currentUserId]);

    const title = useMemo(() => {
      if (conversation.name) return conversation.name;
      if (otherParticipant) return otherParticipant.displayName;
      return 'Encrypted Chat';
    }, [conversation.name, otherParticipant]);

    const lastMessagePreview = useMemo(() => {
      if (!conversation.lastMessage) {
        return 'No messages yet';
      }
      return '🔒 Encrypted message';
    }, [conversation.lastMessage]);

    const formattedTime = useMemo(() => {
      const timestamp = conversation.lastMessage?.createdAt ?? conversation.updatedAt;
      return formatRelativeTime(timestamp);
    }, [conversation.lastMessage, conversation.updatedAt]);

    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onPress(conversation)}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={`Conversation with ${title}${conversation.unreadCount > 0 ? `, ${conversation.unreadCount} unread messages` : ''}`}
        accessibilityHint="Opens encrypted chat room"

        style={[
          styles.container,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border,
            paddingHorizontal: spacing.lg,
          },
        ]}
      >
        <Avatar name={title} size={48} />
        <View style={[styles.content, { marginLeft: spacing.md }]}>
          <View style={styles.topRow}>
            <Text
              style={[typography.bodyLarge, { color: colors.textPrimary, fontWeight: '600' }]}
              numberOfLines={1}
            >
              {title}
            </Text>
            <Text style={[typography.caption, { color: colors.textMuted }]}>{formattedTime}</Text>
          </View>
          <View style={styles.bottomRow}>
            <Text
              style={[
                typography.bodySmall,
                { color: conversation.unreadCount > 0 ? colors.textPrimary : colors.textSecondary },
                conversation.unreadCount > 0 && { fontWeight: '600' },
              ]}
              numberOfLines={1}
            >
              {lastMessagePreview}
            </Text>
            {conversation.unreadCount > 0 ? (
              <Badge count={conversation.unreadCount} variant="primary" />
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    );
  },
  (prev, next) =>
    prev.conversation.id === next.conversation.id &&
    prev.conversation.updatedAt === next.conversation.updatedAt &&
    prev.conversation.unreadCount === next.conversation.unreadCount &&
    prev.conversation.lastMessage?.id === next.conversation.lastMessage?.id &&
    prev.conversation.lastMessage?.status === next.conversation.lastMessage?.status &&
    prev.currentUserId === next.currentUserId,
);

ConversationRow.displayName = 'ConversationRow';

const styles = StyleSheet.create({
  container: {
    height: CONVERSATION_ROW_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
