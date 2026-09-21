import React, { useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useConvexAuth } from 'convex/react';
import { TopBar } from '../components/navigation/TopBar';
import { ProfileSwitchOverlay } from '../components/ProfileSwitchOverlay';
import { useApp } from '../context/AppContext';
import { MainTabNavigator } from './MainTabNavigator';
import type { RootStackParamList } from './types';

export const MainStackScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { isLoading, isAuthenticated } = useConvexAuth();
  const { account } = useApp();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigation.reset({ index: 0, routes: [{ name: 'Auth' }] });
    }
  }, [isLoading, isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated && account && account.displayName === null) {
      navigation.replace('Onboarding');
    }
  }, [isAuthenticated, account]);

  if (!account || account.displayName === null) {
    return <View style={styles.safeArea} />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <TopBar />
      <View style={styles.mainContainer}>
        <MainTabNavigator />
      </View>
      <ProfileSwitchOverlay />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  mainContainer: {
    flex: 1,
    position: 'relative',
  },
});
