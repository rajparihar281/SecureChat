import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { RouteProp } from '@react-navigation/native';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Conversations: undefined;
  Contacts: undefined;
  Settings: undefined;
};

export type ChatStackParamList = {
  ChatRoom: {
    conversationId: string;
    recipientName: string;
    recipientPublicKey?: string;
  };
  SecurityVerification: {
    userId: string;
    username: string;
    publicKey: string;
  };
  ContactProfile: {
    userId: string;
  };
};

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  ChatRoom: {
    conversationId: string;
    recipientName: string;
    recipientPublicKey?: string;
  };
  SecurityVerification: {
    userId: string;
    username: string;
    publicKey: string;
  };
  ContactProfile: {
    userId: string;
  };
};

// Navigation Prop Types
export type RootNavigationProp = NativeStackNavigationProp<RootStackParamList>;
export type AuthNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
export type MainTabNavigationProp = BottomTabNavigationProp<MainTabParamList>;

// Route Prop Types
export type ChatRoomRouteProp = RouteProp<RootStackParamList, 'ChatRoom'>;
export type SecurityVerificationRouteProp = RouteProp<RootStackParamList, 'SecurityVerification'>;
export type ContactProfileRouteProp = RouteProp<RootStackParamList, 'ContactProfile'>;
