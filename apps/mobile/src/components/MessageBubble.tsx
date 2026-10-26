import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MessageFieldsFragment, MessageStatus } from '@securechat/shared';
import { useTheme } from '../theme';
import { formatMessageTime } from '../utils/date';

export interface MessageBubbleProps {
  message: MessageFieldsFragment;
  isOutgoing: boolean;
  senderName?: string;
  decryptedText?: string;
  onRetry?: (message: MessageFieldsFragment) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = React.memo(
  ({ message, isOutgoing, senderName, decryptedText, onRetry }) => {
    const { colors, typography, spacing } = useTheme();

    const formattedTime = useMemo(() => formatMessageTime(message.createdAt), [message.createdAt]);

    const statusIndicator = useMemo(() => {
      if (!isOutgoing) return null;

      switch (message.status) {
        case MessageStatus.Pending:
          return <Text style={[styles.statusIcon, { color: colors.textMuted }]}>🕒</Text>;
        case MessageStatus.Sent:
          return <Text style={[styles.statusIcon, { color: colors.textSecondary }]}>✓</Text>;
        case MessageStatus.Delivered:
          return <Text style={[styles.statusIcon, { color: colors.textSecondary }]}>✓✓</Text>;
        case MessageStatus.Read:
          return <Text style={[styles.statusIcon, { color: colors.accent }]}>✓✓</Text>;
        case MessageStatus.Failed:
          return (
            <TouchableOpacity onPress={() => onRetry?.(message)} style={styles.retryButton}>
              <Text style={[styles.statusIcon, { color: colors.error }]}>⚠️ Retry</Text>
            </TouchableOpacity>
          );
        default:
          return null;
      }
    }, [isOutgoing, message.status, colors, message, onRetry]);

    const displayText = decryptedText ?? '🔒 Encrypted message';

    return (
      <View
        accessible={true}
        accessibilityRole="text"
        accessibilityLabel={`${isOutgoing ? 'Sent message' : `Received message from ${senderName || 'contact'}`}: ${displayText}, at ${formattedTime}`}
        style={[
          styles.container,
          isOutgoing ? styles.outgoingContainer : styles.incomingContainer,
          { marginVertical: spacing.xs, marginHorizontal: spacing.md },
        ]}
      >
        {!isOutgoing && senderName ? (
          <Text
            style={[
              typography.caption,
              { color: colors.primary, marginBottom: 2, marginLeft: 4, fontWeight: '600' },
            ]}
          >
            {senderName}
          </Text>
        ) : null}

        <View
          style={[
            styles.bubble,
            isOutgoing
              ? [styles.outgoingBubble, { backgroundColor: colors.bubbleOutgoing }]
              : [
                  styles.incomingBubble,
                  { backgroundColor: colors.bubbleIncoming, borderColor: colors.border },
                ],
          ]}
        >
          <Text
            style={[
              typography.bodyMedium,
              {
                color: isOutgoing ? colors.textPrimary : colors.textPrimary,
              },
            ]}
          >
            {displayText}
          </Text>

          <View style={styles.footer}>
            <Text
              style={[
                styles.time,
                {
                  color: isOutgoing ? 'rgba(255,255,255,0.7)' : colors.textMuted,
                },
              ]}
            >
              {formattedTime}
            </Text>
            {statusIndicator}
          </View>
        </View>
      </View>
    );
  },
  (prev, next) =>
    prev.message.id === next.message.id &&
    prev.message.status === next.message.status &&
    prev.decryptedText === next.decryptedText &&
    prev.isOutgoing === next.isOutgoing,
);

MessageBubble.displayName = 'MessageBubble';

const styles = StyleSheet.create({
  container: {
    maxWidth: '80%',
  },
  outgoingContainer: {
    alignSelf: 'flex-end',
  },
  incomingContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  outgoingBubble: {
    borderBottomRightRadius: 4,
  },
  incomingBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  time: {
    fontSize: 11,
  },
  statusIcon: {
    fontSize: 11,
    fontWeight: '700',
  },
  retryButton: {
    paddingHorizontal: 2,
  },
});
