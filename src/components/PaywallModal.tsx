import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { COLORS, SPACING, RADIUS, SHADOWS } from '../constants/theme';
import { SubscriptionTier } from '../types';

interface PaywallModalProps {
  visible: boolean;
  currentPlan: SubscriptionTier;
  onSelectPlan: (tier: SubscriptionTier) => void;
  onClose: () => void;
}

export const PaywallModal: React.FC<PaywallModalProps> = ({
  visible,
  currentPlan,
  onSelectPlan,
  onClose,
}) => {
  const [selectedTier, setSelectedTier] = useState<SubscriptionTier>(
    currentPlan === 'free' ? 'plus' : currentPlan
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.badgeLabel}>⚡ VIBELY PREMIUM</Text>
              <Text style={styles.title}>Never Get Stuck On What To Say.</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.bodyScroll} contentContainerStyle={styles.bodyContent}>
            {/* Tiers Grid */}
            <View style={styles.plansContainer}>
              {/* Plus Plan ($6.99) */}
              <TouchableOpacity
                style={[
                  styles.planCard,
                  selectedTier === 'plus' && styles.planCardActive,
                ]}
                onPress={() => setSelectedTier('plus')}
                activeOpacity={0.9}
              >
                <View style={styles.popularBadge}>
                  <Text style={styles.popularText}>MOST POPULAR</Text>
                </View>

                <View style={styles.planHeader}>
                  <View>
                    <Text style={styles.planTitle}>Plus</Text>
                    <Text style={styles.planSub}>Your everyday wingman</Text>
                  </View>
                  <Text style={styles.planPrice}>$6.99<Text style={styles.perMonth}>/mo</Text></Text>
                </View>

                <View style={styles.featureList}>
                  <Text style={styles.featureItem}>✓ Unlimited conversation analyses</Text>
                  <Text style={styles.featureItem}>✓ 📸 Screenshot vision analysis</Text>
                  <Text style={styles.featureItem}>✓ All 10+ conversation vibes</Text>
                  <Text style={styles.featureItem}>✓ 🎭 Personality profiles & memory</Text>
                  <Text style={styles.featureItem}>✓ 🧠 Conversation Pulse & Subtext</Text>
                  <Text style={styles.featureItem}>✓ 🔥 Follow-up dialogue suggestions</Text>
                </View>
              </TouchableOpacity>

              {/* Pro Plan ($12.99) */}
              <TouchableOpacity
                style={[
                  styles.planCard,
                  selectedTier === 'pro' && styles.planCardActive,
                ]}
                onPress={() => setSelectedTier('pro')}
                activeOpacity={0.9}
              >
                <View style={styles.proBadge}>
                  <Text style={styles.proBadgeText}>ULTIMATE</Text>
                </View>

                <View style={styles.planHeader}>
                  <View>
                    <Text style={styles.planTitle}>Pro</Text>
                    <Text style={styles.planSub}>Advanced conversation coach</Text>
                  </View>
                  <Text style={styles.planPrice}>$12.99<Text style={styles.perMonth}>/mo</Text></Text>
                </View>

                <View style={styles.featureList}>
                  <Text style={styles.featureItem}>✓ Everything in Plus</Text>
                  <Text style={styles.featureItem}>✓ Unlimited relationship profiles</Text>
                  <Text style={styles.featureItem}>✓ Long-term conversation memory</Text>
                  <Text style={styles.featureItem}>✓ "Plan My Conversation" roadmaps</Text>
                  <Text style={styles.featureItem}>✓ 🎙️ Voice-message analysis</Text>
                  <Text style={styles.featureItem}>✓ Personalized response style learning</Text>
                </View>
              </TouchableOpacity>

              {/* Free Plan */}
              <TouchableOpacity
                style={[
                  styles.planCard,
                  styles.freeCard,
                  selectedTier === 'free' && styles.planCardActive,
                ]}
                onPress={() => setSelectedTier('free')}
                activeOpacity={0.9}
              >
                <View style={styles.planHeader}>
                  <View>
                    <Text style={styles.planTitle}>Free</Text>
                    <Text style={styles.planSub}>Starter plan</Text>
                  </View>
                  <Text style={styles.planPrice}>$0<Text style={styles.perMonth}>/mo</Text></Text>
                </View>

                <View style={styles.featureList}>
                  <Text style={styles.featureItemMuted}>• 3 conversation analyses / month</Text>
                  <Text style={styles.featureItemMuted}>• 3 replies per analysis</Text>
                  <Text style={styles.featureItemMuted}>• Basic moods & paste text only</Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>

          {/* Footer CTA */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.subscribeBtn}
              onPress={() => {
                onSelectPlan(selectedTier);
                onClose();
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.subscribeBtnText}>
                {selectedTier === 'free' ? 'Continue with Free' : `Unlock ${selectedTier.toUpperCase()} Now 🚀`}
              </Text>
            </TouchableOpacity>
            <Text style={styles.guaranteeText}>Cancel anytime. 7-day money back guarantee.</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: RADIUS.lg,
    borderTopRightRadius: RADIUS.lg,
    maxHeight: '92%',
    minHeight: '75%',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    ...SHADOWS.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  badgeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  closeBtn: {
    padding: SPACING.xs,
  },
  closeBtnText: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  bodyScroll: {
    flex: 1,
  },
  bodyContent: {
    padding: SPACING.md,
  },
  plansContainer: {
    gap: SPACING.md,
  },
  planCard: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    position: 'relative',
    ...SHADOWS.sm,
  },
  planCardActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#fff0f6',
  },
  freeCard: {
    opacity: 0.8,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  popularText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
  },
  proBadge: {
    position: 'absolute',
    top: -12,
    right: 16,
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  proBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  planTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  planSub: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  planPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  perMonth: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '400',
  },
  featureList: {
    gap: 4,
  },
  featureItem: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  featureItemMuted: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  footer: {
    padding: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    alignItems: 'center',
    gap: 6,
  },
  subscribeBtn: {
    width: '100%',
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  subscribeBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  guaranteeText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
});
