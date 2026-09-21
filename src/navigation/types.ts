import type { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  Pulse: undefined;
  Profiles: undefined;
  Pro: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Onboarding: undefined;
  Main: NavigatorScreenParams<MainTabParamList> | undefined;
  Studio: { conversationId?: string } | undefined;
  NewSessionFlow: undefined;
};
