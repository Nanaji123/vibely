import React, { useEffect, useRef } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useConvexAuth } from 'convex/react';

import { useApp } from '../context/AppContext';
import { SplashScreen } from '../screens/SplashScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { ChatStudioScreen } from '../screens/ChatStudioScreen';
import { NewSessionFlowScreen } from '../screens/NewSessionFlowScreen';
import { MainStackScreen } from './MainStackScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const SplashRouteScreen: React.FC<NativeStackScreenProps<RootStackParamList, 'Splash'>> = ({
  navigation,
}) => {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const navigated = useRef(false);

  const goNext = () => {
    if (navigated.current) return;
    navigated.current = true;
    navigation.replace(isAuthenticated ? 'Main' : 'Auth');
  };

  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(goNext, 800);
    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated]);

  return <SplashScreen onFinish={goNext} />;
};

const AuthRouteScreen: React.FC<NativeStackScreenProps<RootStackParamList, 'Auth'>> = ({
  navigation,
}) => {
  const { isLoading, isAuthenticated } = useConvexAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigation.replace('Main');
    }
  }, [isLoading, isAuthenticated]);

  return <AuthScreen />;
};

const StudioRouteScreen: React.FC<NativeStackScreenProps<RootStackParamList, 'Studio'>> = ({
  navigation,
}) => {
  const { activeProfile, currentConversation, updateMessages } = useApp();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <ChatStudioScreen
        activeProfile={activeProfile}
        messages={currentConversation.messages}
        onUpdateMessages={updateMessages}
        onBack={() => navigation.goBack()}
      />
    </SafeAreaView>
  );
};

const NewSessionFlowRouteScreen: React.FC<
  NativeStackScreenProps<RootStackParamList, 'NewSessionFlow'>
> = ({ navigation }) => {
  const { activeProfile, startNewSession, createCustomSession } = useApp();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <NewSessionFlowScreen
        activeProfile={activeProfile}
        onBack={() => navigation.goBack()}
        onStartNewSession={startNewSession}
        onCreateCustomSession={async (rawText, mode, profile) => {
          await createCustomSession(rawText, mode, profile);
        }}
        onOpenStudio={() => navigation.replace('Studio')}
      />
    </SafeAreaView>
  );
};

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashRouteScreen} />
      <Stack.Screen name="Auth" component={AuthRouteScreen} />
      <Stack.Screen name="Main" component={MainStackScreen} />
      <Stack.Screen name="Studio" component={StudioRouteScreen} />
      <Stack.Screen name="NewSessionFlow" component={NewSessionFlowRouteScreen} />
    </Stack.Navigator>
  );
};
