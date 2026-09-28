import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { navigationRef } from './navigationRef';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { ChatRoomScreen, SecurityVerificationScreen, ContactProfileScreen } from '../screens';
import { useTheme } from '../theme';

const Stack = createNativeStackNavigator<RootStackParamList>();

export interface RootNavigatorProps {
  isAuthenticated?: boolean;
}

export const RootNavigator: React.FC<RootNavigatorProps> = ({ isAuthenticated = false }) => {
  const { colors, isDark } = useTheme();

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={{
        dark: isDark,
        colors: {
          primary: colors.primary,
          background: colors.background,
          card: colors.surface,
          text: colors.textPrimary,
          border: colors.border,
          notification: colors.badgeUnread,
        },
      }}
    >
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
            <Stack.Screen name="SecurityVerification" component={SecurityVerificationScreen} />
            <Stack.Screen name="ContactProfile" component={ContactProfileScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
