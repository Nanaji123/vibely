import React, { useState } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useApp } from '../context/AppContext';
import { TopBar } from '../components/navigation/TopBar';
import { FloatingTabBar, MainTabKey } from '../components/navigation/FloatingTabBar';

import { SplashScreen } from '../screens/SplashScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ChatStudioScreen } from '../screens/ChatStudioScreen';
import { PulseAnalysisScreen } from '../screens/PulseAnalysisScreen';
import { ProfileManagerScreen } from '../screens/ProfileManagerScreen';
import { PaywallScreen } from '../screens/PaywallScreen';

export type RootView = 'splash' | 'auth' | 'main' | 'studio';

export const Navigator: React.FC = () => {
  const [rootView, setRootView] = useState<RootView>('splash');
  const [activeTab, setActiveTab] = useState<MainTabKey>('home');

  const {
    activeProfile,
    subscription,
    conversations,
    currentConversation,
    profiles,
    selectProfile,
    addProfile,
    startNewSession,
    createCustomSession,
    loadConversation,
    updateMessages,
    upgradePlan,
  } = useApp();

  // 1. Splash Screen
  if (rootView === 'splash') {
    return <SplashScreen onFinish={() => setRootView('auth')} />;
  }

  // 2. Auth Screen
  if (rootView === 'auth') {
    return <AuthScreen onSignInSuccess={() => setRootView('main')} />;
  }

  // 3. FULLSCREEN CHAT STUDIO (Zero Global Header & Zero Bottom Tab Bar!)
  if (rootView === 'studio') {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <ChatStudioScreen
          activeProfile={activeProfile}
          messages={currentConversation.messages}
          onUpdateMessages={updateMessages}
          onBack={() => setRootView('main')}
        />
      </SafeAreaView>
    );
  }

  // 4. MAIN DASHBOARD (Shows TopBar and FloatingTabBar)
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Global Top Bar on Dashboard Tabs */}
      <TopBar
        activeProfile={activeProfile}
        profiles={profiles}
        subscription={subscription}
        conversations={conversations}
        onSelectProfile={selectProfile}
        onOpenPro={() => setActiveTab('pro')}
        onLogout={() => setRootView('auth')}
        onOpenConversation={(conv) => {
          loadConversation(conv);
          setRootView('studio');
        }}
      />

      {/* Main Tab Views */}
      <View style={styles.mainContainer}>
        {activeTab === 'home' && (
          <HomeScreen
            activeProfile={activeProfile}
            recentConversations={conversations}
            onStartNewSession={() => {
              startNewSession();
              setRootView('studio'); // Direct fullscreen jump
            }}
            onCreateCustomSession={(rawText, mode) => {
              createCustomSession(rawText, mode, activeProfile);
            }}
            onOpenConversation={(conv) => {
              loadConversation(conv);
              setRootView('studio'); // Direct fullscreen jump
            }}
            onSwitchProfile={() => setActiveTab('profiles')}
          />
        )}

        {activeTab === 'pulse' && (
          <PulseAnalysisScreen
            activeProfile={activeProfile}
            conversation={currentConversation}
          />
        )}

        {activeTab === 'profiles' && (
          <ProfileManagerScreen
            profiles={profiles}
            activeProfile={activeProfile}
            onSelectProfile={(p) => {
              selectProfile(p);
              setActiveTab('home');
            }}
            onAddProfile={addProfile}
          />
        )}

        {activeTab === 'pro' && (
          <PaywallScreen
            subscription={subscription}
            onUpgrade={(plan) => {
              upgradePlan(plan);
              setActiveTab('home');
            }}
          />
        )}
      </View>

      {/* Floating Bottom Navigation Bar (ONLY on dashboard) */}
      <FloatingTabBar activeTab={activeTab} onSelectTab={setActiveTab} />
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
