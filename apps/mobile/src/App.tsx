import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ApolloProvider } from '@apollo/client';
import { ThemeProvider, useTheme } from './theme';
import { RootNavigator } from './navigation';
import { createApolloClient } from './graphql/client';

const apolloClient = createApolloClient();

const AppContent: React.FC = () => {
  const { isDark, colors } = useTheme();

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <RootNavigator isAuthenticated={false} />
    </>
  );
};

export const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <ApolloProvider client={apolloClient}>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </ApolloProvider>
    </SafeAreaProvider>
  );
};

export default App;
