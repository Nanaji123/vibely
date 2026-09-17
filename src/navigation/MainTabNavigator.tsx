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
  const { activeProfile, conversations, createCustomSession, loadConversation } = useApp();

  return (
    <HomeScreen
      activeProfile={activeProfile}
      recentConversations={conversations}
      onStartNewSession={() => navigation.getParent<NativeStackNavigationProp<RootStackParamList>>()?.navigate('NewSessionFlow')}
      onCreateCustomSession={async (rawText, mode) => {
        await createCustomSession(rawText, mode, activeProfile);
        navigation.getParent<NativeStackNavigationProp<RootStackParamList>>()?.navigate('Studio');
      }}
      onOpenConversation={(conv) => {
        loadConversation(conv);
        navigation.getParent<NativeStackNavigationProp<RootStackParamList>>()?.navigate('Studio');
      }}
      onSwitchProfile={() => navigation.navigate('Profiles')}
    />
  );
};

const PulseTabScreen: React.FC = () => {
  const { activeProfile, currentConversation } = useApp();
  return <PulseAnalysisScreen activeProfile={activeProfile} conversation={currentConversation} />;
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
