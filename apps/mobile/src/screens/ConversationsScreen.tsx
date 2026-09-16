import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme';
import { Header, EmptyState } from '../components';
import { RootNavigationProp } from '../navigation/types';

export const ConversationsScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="SecureChat" />

      <EmptyState
        icon="🔐"
        title="No Conversations Yet"
        description="Your messages are end-to-end encrypted. Start a conversation with a verified contact."
        actionTitle="Find Contacts"
        onAction={() => {
          navigation.navigate('Main', { screen: 'Contacts' } as never);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
