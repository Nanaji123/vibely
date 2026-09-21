import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { FloatingTabBar } from '../components/navigation/FloatingTabBar';
import { useApp } from '../context/AppContext';
import { HomeScreen } from '../screens/HomeScreen';
import { PulseAnalysisScreen } from '../screens/PulseAnalysisScreen';
import { ProfileManagerScreen } from '../screens/ProfileManagerScreen';
import type { MainTabParamList, RootStackParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

type TabNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

const HomeTabScreen: React.FC = () => {
  const navigation = useNavigation<TabNav>();
  const { activeProfile, hasProfiles, conversations, currentConversation, startNewSession, loadConversation, subscription, showPaywall, account, profiles, selectProfile } =
    useApp();
  const root = () => navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <HomeScreen
      activeProfile={activeProfile}
      hasProfiles={hasProfiles}
      profiles={profiles}
      recentConversations={conversations}
      currentConversation={currentConversation}
      subscription={subscription}
      displayName={account?.displayName || account?.googleName || ''}
      onStartNewSession={(method) => root()?.navigate('NewSessionFlow', method ? { method } : undefined)}
      onSelectProfile={selectProfile}
      onOpenPaywall={showPaywall}
      onViewAllChats={() => root()?.navigate('History')}
      onOpenConversation={(conv) => {
        loadConversation(conv);
        root()?.navigate('Studio');
      }}
      onStartChat={async () => {
        await startNewSession();
        root()?.navigate('Studio');
      }}
      onSwitchProfile={() => navigation.navigate('Profiles')}
      onCreateProfile={() => navigation.navigate('Profiles')}
    />
  );
};

const PulseTabScreen: React.FC = () => {
  const navigation = useNavigation<TabNav>();
  const { activeProfile, currentConversation, hasProfiles, analyzeCurrentConversation } = useApp();
  return (
    <PulseAnalysisScreen
      activeProfile={activeProfile}
      hasProfiles={hasProfiles}
      conversation={currentConversation}
      onAnalyze={analyzeCurrentConversation}
      onGetStarted={() =>
        hasProfiles
          ? navigation.getParent<NativeStackNavigationProp<RootStackParamList>>()?.navigate('NewSessionFlow')
          : navigation.navigate('Profiles')
      }
    />
  );
};

const ProfilesTabScreen: React.FC = () => {
  const { profiles, activeProfile, selectProfile, addProfile, editProfile, deleteProfile } = useApp();
  return (
    <ProfileManagerScreen
      profiles={profiles}
      activeProfile={activeProfile}
      onSelectProfile={selectProfile}
      onAddProfile={addProfile}
      onEditProfile={editProfile}
      onDeleteProfile={deleteProfile}
    />
  );
};

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeTabScreen} />
      <Tab.Screen name="Pulse" component={PulseTabScreen} />
      <Tab.Screen name="Profiles" component={ProfilesTabScreen} />
    </Tab.Navigator>
  );
};
