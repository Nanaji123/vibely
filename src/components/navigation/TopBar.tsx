import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Switch,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Palette, ThemeColors } from '../../theme/colors';
import { ThemeShadows } from '../../theme/shadows';
import { TargetProfileModel, UserSubscriptionModel, ConversationModel } from '../../domain';

export interface WingmanNotification {
  id: string;
  type: 'followup' | 'signal' | 'tip';
  targetName: string;
  timeAgo: string;
  title: string;
  message: string;
  isUnread: boolean;
}

interface TopBarProps {
  activeProfile: TargetProfileModel;
  profiles: TargetProfileModel[];
  subscription: UserSubscriptionModel;
  conversations?: ConversationModel[];
  onSelectProfile: (profile: TargetProfileModel) => void;
  onOpenPro: () => void;
  onLogout?: () => void;
  onOpenConversation?: (conv: ConversationModel) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeProfile,
  profiles,
  subscription,
  conversations = [],
  onSelectProfile,
  onOpenPro,
  onLogout,
  onOpenConversation,
}) => {
  // Modal States
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);

  // Notification Preferences Toggles
  const [prefFollowups, setPrefFollowups] = useState(true);
  const [prefSignals, setPrefSignals] = useState(true);
  const [prefDailyAdvice, setPrefDailyAdvice] = useState(false);

  // In-App Wingman Notifications List
  const [notifications, setNotifications] = useState<WingmanNotification[]>([
    {
      id: 'notif-1',
      type: 'followup',
      targetName: 'Sarah',
      timeAgo: '1d ago',
      title: '⚠️ Unanswered Message Alert',
      message:
        "Have you messaged Sarah? It's already been 1 day since she said 'Probably just staying home lol'. She may think you're not interested! Send a teasing check-in.",
      isUnread: true,
    },
    {
      id: 'notif-2',
      type: 'signal',
      targetName: 'Laxmi',
      timeAgo: '2h ago',
      title: '🔥 Hot Signal Alert',
      message:
        "Laxmi replied in under 3 minutes with 'haha maybe 😂'! Her interest is peaked right now. Don't wait too long to counter.",
      isUnread: true,
    },
    {
      id: 'notif-3',
      type: 'tip',
      targetName: 'General',
      timeAgo: '5h ago',
      title: '🧠 Effort Ratio Check',
      message:
        'Great job keeping your conversation effort balanced at 48% vs 52%. Your texts are high-value and concise.',
      isUnread: false,
    },
  ]);

  const unreadCount = notifications.filter(n => n.isUnread).length;

  const genderBadge =
    activeProfile.gender === 'female' ? '👩' : activeProfile.gender === 'male' ? '👨' : '🧑';

  // Mark all notifications as read
  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isUnread: false })));
  };

  // Open conversation from notification
  const handleNotificationClick = (targetName: string) => {
    setShowNotificationsModal(false);
    const matchedConv = conversations.find(
      c => c.targetName.toLowerCase() === targetName.toLowerCase()
    );
    if (matchedConv && onOpenConversation) {
      onOpenConversation(matchedConv);
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. BRAND IDENTITY & APP ICON (Clicking opens User Account Profile!) */}
      <TouchableOpacity
        style={styles.brandRow}
        onPress={() => setShowUserProfileModal(true)}
        activeOpacity={0.75}
      >
        <View style={styles.logoSquare}>
          <Feather name="zap" size={16} color="#ffffff" />
        </View>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Text style={styles.brandName}>Vibely</Text>
            <Feather name="chevron-down" size={11} color={Palette.zinc400} />
          </View>
          <Text style={styles.tagline}>AI Wingman</Text>
        </View>
      </TouchableOpacity>

      {/* 2. RIGHT CONTROLS: Profile Context Switcher & Notification Bell */}
      <View style={styles.actionsRow}>
        {/* In-place Profile Switcher Button */}
        <TouchableOpacity
          style={styles.profilePill}
          onPress={() => setShowProfileSwitcher(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.avatarEmoji}>{activeProfile.avatarEmoji || genderBadge}</Text>
          <Text style={styles.profileText} numberOfLines={1}>
            {activeProfile.name}
          </Text>
          <Feather name="chevron-down" size={12} color={Palette.zinc600} />
        </TouchableOpacity>

        {/* Bell Notification Icon (Replaced PRO button as requested!) */}
        <TouchableOpacity
          style={styles.bellButton}
          onPress={() => setShowNotificationsModal(true)}
          activeOpacity={0.8}
        >
          <Feather name="bell" size={18} color={Palette.zinc800} />
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ========================================================================= */}
      {/* MODAL 1: USER ACCOUNT PROFILE (Opened when App Icon is clicked!) */}
      {/* ========================================================================= */}
      <Modal visible={showUserProfileModal} animationType="slide" transparent>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowUserProfileModal(false)}
        >
          <View style={styles.userProfileCard}>
            {/* Header */}
            <View style={styles.userProfileHeader}>
              <View style={styles.userInfoLeft}>
                <View style={styles.userAvatarCircle}>
                  <Text style={styles.userAvatarInitials}>JD</Text>
                </View>
                <View>
                  <Text style={styles.userNameText}>John Doe</Text>
                  <Text style={styles.userEmailText}>john.doe@vibely.ai</Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setShowUserProfileModal(false)}
              >
                <Feather name="x" size={20} color={Palette.zinc700} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ paddingHorizontal: 16 }}>
              {/* Current Plan Section */}
              <View style={styles.planSectionBox}>
                <View style={styles.planHeaderRow}>
                  <View>
                    <Text style={styles.planSectionLabel}>CURRENT PLAN</Text>
                    <Text style={styles.planNameText}>
                      {subscription.plan === 'pro'
                        ? 'Vibely Pro ($12.99/mo)'
                        : subscription.plan === 'plus'
                        ? 'Vibely Plus ($6.99/mo)'
                        : 'Free Starter Plan'}
                    </Text>
                  </View>
                  <View style={styles.planStatusBadge}>
                    <Text style={styles.planStatusText}>
                      {subscription.unlimited ? 'UNLIMITED' : `${subscription.creditsRemaining} CREDITS`}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.upgradePlanBtn}
                  onPress={() => {
                    setShowUserProfileModal(false);
                    onOpenPro();
                  }}
                  activeOpacity={0.85}
                >
                  <Feather name="zap" size={13} color="#ffffff" />
                  <Text style={styles.upgradePlanBtnText}>Manage / Upgrade Plan</Text>
                </TouchableOpacity>
              </View>

              {/* Notification Preferences Section */}
              <View style={styles.settingsSection}>
                <Text style={styles.settingsSectionTitle}>NOTIFICATION PREFERENCES</Text>

                {/* Toggle 1: Followup Alerts */}
                <View style={styles.toggleRow}>
                  <View style={styles.toggleLeft}>
                    <Feather name="clock" size={15} color={Palette.indigo600} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.toggleTitle}>Stale Chat Follow-up Nudges</Text>
                      <Text style={styles.toggleSub}>
                        Alerts when it's been &gt;24h so they don't think you lost interest
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={prefFollowups}
                    onValueChange={setPrefFollowups}
                    trackColor={{ false: Palette.zinc200, true: Palette.indigo600 }}
                    thumbColor="#ffffff"
                  />
                </View>

                {/* Toggle 2: High Interest Signals */}
                <View style={styles.toggleRow}>
                  <View style={styles.toggleLeft}>
                    <Feather name="activity" size={15} color={Palette.emerald600} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.toggleTitle}>Interest Spike Notifications</Text>
                      <Text style={styles.toggleSub}>
                        Nudge to strike when they reply in under 3 minutes
                      </Text>
                    </View>
                  </View>
                  <Switch
                    value={prefSignals}
                    onValueChange={setPrefSignals}
                    trackColor={{ false: Palette.zinc200, true: Palette.indigo600 }}
                    thumbColor="#ffffff"
                  />
                </View>

                {/* Toggle 3: Daily Wingman Advice */}
                <View style={styles.toggleRow}>
                  <View style={styles.toggleLeft}>
                    <Feather name="compass" size={15} color={Palette.zinc700} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.toggleTitle}>Daily Wingman Tactics</Text>
                      <Text style={styles.toggleSub}>Bite-sized social dynamics & frame tips</Text>
                    </View>
                  </View>
                  <Switch
                    value={prefDailyAdvice}
                    onValueChange={setPrefDailyAdvice}
                    trackColor={{ false: Palette.zinc200, true: Palette.indigo600 }}
                    thumbColor="#ffffff"
                  />
                </View>
              </View>

              {/* Logout Button */}
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={() => {
                  setShowUserProfileModal(false);
                  if (onLogout) onLogout();
                }}
                activeOpacity={0.85}
              >
                <Feather name="log-out" size={16} color="#dc2626" />
                <Text style={styles.logoutBtnText}>Log Out of Vibely</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: WINGMAN NOTIFICATIONS DRAWER (Bell Icon Clicked!) */}
      {/* ========================================================================= */}
      <Modal visible={showNotificationsModal} animationType="slide" transparent>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowNotificationsModal(false)}
        >
          <View style={styles.notifsCard}>
            <View style={styles.notifsHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={styles.notifIconCircle}>
                  <Feather name="bell" size={16} color={Palette.indigo600} />
                </View>
                <View>
                  <Text style={styles.notifsTitle}>Wingman Alerts & Nudges</Text>
                  <Text style={styles.notifsSub}>{unreadCount} unread intelligent nudges</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.closeBtn} onPress={() => setShowNotificationsModal(false)}>
                <Feather name="x" size={18} color={Palette.zinc700} />
              </TouchableOpacity>
            </View>

            {unreadCount > 0 && (
              <TouchableOpacity style={styles.markReadRow} onPress={handleMarkAllRead}>
                <Text style={styles.markReadText}>Mark all as read</Text>
              </TouchableOpacity>
            )}

            <ScrollView style={{ paddingHorizontal: 16, maxHeight: 360 }}>
              {notifications.map(n => (
                <TouchableOpacity
                  key={n.id}
                  style={[styles.notifItemCard, n.isUnread && styles.notifItemUnread]}
                  onPress={() => handleNotificationClick(n.targetName)}
                  activeOpacity={0.85}
                >
                  <View style={styles.notifItemTop}>
                    <View style={styles.notifTypeBadge}>
                      <Text style={styles.notifTypeBadgeText}>
                        {n.type === 'followup' ? '⚠️ TIME NUDGE' : n.type === 'signal' ? '🔥 HOT SIGNAL' : '🧠 TACTIC'}
                      </Text>
                    </View>
                    <Text style={styles.notifTimeAgo}>{n.timeAgo}</Text>
                  </View>

                  <Text style={styles.notifItemTitle}>{n.title}</Text>
                  <Text style={styles.notifItemMessage}>{n.message}</Text>

                  {n.targetName !== 'General' && (
                    <View style={styles.notifActionRow}>
                      <Text style={styles.notifActionText}>Open {n.targetName}'s chat →</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 3: IN-PLACE TARGET PROFILE SWITCHER (No tab redirection!) */}
      {/* ========================================================================= */}
      <Modal visible={showProfileSwitcher} animationType="fade" transparent>
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setShowProfileSwitcher(false)}
        >
          <View style={styles.switcherCard}>
            <View style={styles.switcherHeader}>
              <View>
                <Text style={styles.switcherTitle}>Switch Active Person</Text>
                <Text style={styles.switcherSub}>Select who you're talking about</Text>
              </View>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setShowProfileSwitcher(false)}
                activeOpacity={0.7}
              >
                <Feather name="x" size={18} color={Palette.zinc700} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 280 }}>
              {profiles.map((p) => {
                const isActive = p.id === activeProfile.id;
                const pGender = p.gender === 'female' ? '👩 Her' : p.gender === 'male' ? '👨 Him' : '🧑 Them';

                return (
                  <TouchableOpacity
                    key={p.id}
                    style={[styles.profileItem, isActive && styles.profileItemActive]}
                    onPress={() => {
                      onSelectProfile(p);
                      setShowProfileSwitcher(false);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.profileItemAvatar}>
                      <Text style={{ fontSize: 18 }}>{p.avatarEmoji || '❤️'}</Text>
                    </View>

                    <View style={styles.profileItemInfo}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={styles.profileItemName}>{p.name}</Text>
                        <View style={styles.profileItemGender}>
                          <Text style={styles.profileItemGenderText}>{pGender}</Text>
                        </View>
                      </View>
                      <Text style={styles.profileItemRel}>
                        {p.relationship.toUpperCase()} • {p.vibeSummary || 'Active'}
                      </Text>
                    </View>

                    {isActive && (
                      <View style={styles.activeCheckPill}>
                        <Feather name="check" size={13} color={Palette.emerald600} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    ...ThemeShadows.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoSquare: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: Palette.zinc900,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandName: {
    fontSize: 17,
    fontWeight: '800',
    color: Palette.zinc900,
    letterSpacing: -0.3,
  },
  tagline: {
    fontSize: 10,
    color: Palette.zinc500,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    gap: 5,
  },
  avatarEmoji: {
    fontSize: 13,
  },
  profileText: {
    fontSize: 12,
    fontWeight: '700',
    color: Palette.zinc900,
    maxWidth: 75,
  },
  bellButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#f4f4f5',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  unreadBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#dc2626',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  unreadBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
  },

  /* MODAL COMMON BACKDROP */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(9, 9, 11, 0.5)',
    justifyContent: 'flex-end',
  },

  /* USER PROFILE MODAL */
  userProfileCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 36,
    maxHeight: '85%',
  },
  userProfileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  userInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.zinc900,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarInitials: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  userNameText: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.zinc900,
  },
  userEmailText: {
    fontSize: 11,
    color: Palette.zinc500,
  },
  planSectionBox: {
    backgroundColor: '#fafafa',
    borderRadius: 14,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  planHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  planSectionLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: Palette.zinc500,
    letterSpacing: 0.5,
  },
  planNameText: {
    fontSize: 14,
    fontWeight: '800',
    color: Palette.zinc900,
    marginTop: 2,
  },
  planStatusBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  planStatusText: {
    fontSize: 10,
    fontWeight: '800',
    color: Palette.emerald600,
  },
  upgradePlanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.zinc900,
    paddingVertical: 9,
    borderRadius: 8,
    gap: 6,
  },
  upgradePlanBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#ffffff',
  },
  settingsSection: {
    marginTop: 16,
  },
  settingsSectionTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: Palette.zinc500,
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 12,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    flex: 1,
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.zinc900,
  },
  toggleSub: {
    fontSize: 11,
    color: Palette.zinc500,
    marginTop: 2,
    lineHeight: 15,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fef2f2',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
    marginTop: 20,
    marginBottom: 10,
  },
  logoutBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#dc2626',
  },

  /* NOTIFICATIONS MODAL */
  notifsCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    maxHeight: '80%',
  },
  notifsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  notifIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Palette.indigo50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notifsTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: Palette.zinc900,
  },
  notifsSub: {
    fontSize: 11,
    color: Palette.zinc500,
  },
  markReadRow: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'flex-end',
  },
  markReadText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.indigo600,
  },
  notifItemCard: {
    backgroundColor: '#fafafa',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  notifItemUnread: {
    backgroundColor: '#ffffff',
    borderColor: Palette.indigo600,
    borderLeftWidth: 3,
  },
  notifItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTypeBadge: {
    backgroundColor: Palette.zinc100,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  notifTypeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: Palette.zinc700,
  },
  notifTimeAgo: {
    fontSize: 10,
    color: Palette.zinc400,
  },
  notifItemTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Palette.zinc900,
    marginBottom: 4,
  },
  notifItemMessage: {
    fontSize: 12,
    color: Palette.zinc700,
    lineHeight: 17,
    marginBottom: 8,
  },
  notifActionRow: {
    alignSelf: 'flex-start',
  },
  notifActionText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: Palette.indigo600,
  },

  /* IN-PLACE SWITCHER */
  switcherCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    paddingBottom: 32,
    ...ThemeShadows.md,
  },
  switcherHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 12,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  switcherTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.zinc900,
  },
  switcherSub: {
    fontSize: 11,
    color: Palette.zinc500,
    marginTop: 1,
  },
  closeBtn: {
    padding: 4,
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    gap: 10,
  },
  profileItemActive: {
    backgroundColor: '#f8fafc',
  },
  profileItemAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f4f4f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileItemInfo: {
    flex: 1,
  },
  profileItemName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: Palette.zinc900,
  },
  profileItemGender: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  profileItemGenderText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: Palette.indigo600,
  },
  profileItemRel: {
    fontSize: 10.5,
    color: Palette.zinc500,
    marginTop: 2,
  },
  activeCheckPill: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ecfdf5',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
