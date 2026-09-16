import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { Header, EmptyState } from '../components';

export const ContactsScreen: React.FC = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header title="Contacts" />
      <EmptyState
        icon="👥"
        title="Encrypted Contacts"
        description="Search for contacts by username to verify their public key fingerprint and start a chat."
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
