import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ApolloProvider } from '@apollo/client';
import { ThemeProvider, useTheme } from './theme';
import { RootNavigator } from './navigation';
import { createApolloClient } from './graphql/client';
import { SessionManager, AuthProvider, useAuth } from './auth';
import { LoadingSpinner } from './components';

const sessionManager = SessionManager.getInstance();
const apolloClient = createApolloClient({ tokenProvider: sessionManager });

const AppContent: React.FC = () => {
  const { isDark, colors } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Initializing SecureChat..." />;
  }

  return (
    <>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <RootNavigator isAuthenticated={isAuthenticated} />
    </>
  );
};

export const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <ApolloProvider client={apolloClient}>
        <AuthProvider>
          <ThemeProvider>
            <AppContent />
          </ThemeProvider>
        </AuthProvider>
      </ApolloProvider>
    </SafeAreaProvider>
  );
};

export default App;
