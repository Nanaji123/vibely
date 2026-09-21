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
import { PaywallScreen } from '../screens/PaywallScreen';
import type { MainTabParamList, RootStackParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

type TabNav = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

const HomeTabScreen: React.FC = () => {
  const navigation = useNavigation<TabNav>();
  const { activeProfile, hasProfiles, conversations, startNewSession, loadConversation } = useApp();
  const root = () => navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <HomeScreen
      activeProfile={activeProfile}
      hasProfiles={hasProfiles}
      recentConversations={conversations}
      onStartNewSession={() => root()?.navigate('NewSessionFlow')}
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
  const { activeProfile, currentConversation, hasProfiles, analyzeCurrentConversation } = useApp();
  return (
    <PulseAnalysisScreen
      activeProfile={activeProfile}
      hasProfiles={hasProfiles}
      conversation={currentConversation}
      onAnalyze={analyzeCurrentConversation}
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

const ProTabScreen: React.FC = () => {
  const navigation = useNavigation<TabNav>();
  const { subscription, upgradePlan } = useApp();
  return (
    <PaywallScreen
      subscription={subscription}
      onUpgrade={(plan) => {
        upgradePlan(plan);
        navigation.navigate('Home');
      }}
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
      <Tab.Screen name="Pro" component={ProTabScreen} />
    </Tab.Navigator>
  );
};
