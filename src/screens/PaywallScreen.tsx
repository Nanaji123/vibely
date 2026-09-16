import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Palette, ThemeColors } from '../theme/colors';
import { ThemeShadows } from '../theme/shadows';
import { UserSubscriptionModel } from '../domain';

interface PaywallScreenProps {
  subscription: UserSubscriptionModel;
  onUpgrade: (plan: 'plus' | 'pro') => void;
}

export const PaywallScreen: React.FC<PaywallScreenProps> = ({
  subscription,
  onUpgrade,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<'plus' | 'pro'>('plus');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badge}>
          <Feather name="zap" size={12} color="#ffffff" />
          <Text style={styles.badgeText}>VIBELY PRO</Text>
        </View>
        <Text style={styles.title}>Never Get Stuck On What To Say</Text>
        <Text style={styles.subtitle}>
          Unlock unlimited conversation analyses, vision screenshot parsing & multi-turn dialog trees.
        </Text>
      </View>

      {/* Plan Selector Cards */}
      <View style={styles.cardsContainer}>
        {/* Plus Plan ($6.99) */}
        <TouchableOpacity
          style={[styles.planCard, selectedPlan === 'plus' && styles.planCardActive]}
          onPress={() => setSelectedPlan('plus')}
          activeOpacity={0.85}
        >
          <View style={styles.popularBadge}>
            <Text style={styles.popularText}>MOST POPULAR</Text>
          </View>

          <View style={styles.cardTop}>
            <View>
              <Text style={styles.planName}>Plus</Text>
              <Text style={styles.planSub}>Everyday conversation wingman</Text>
            </View>
            <Text style={styles.price}>
              $6.99<Text style={styles.perMonth}>/mo</Text>
            </Text>
          </View>

          <View style={styles.featuresList}>
            <Text style={styles.featureItem}>✓ Unlimited conversation analyses</Text>
            <Text style={styles.featureItem}>✓ 📸 Screenshot OCR chat parser</Text>
            <Text style={styles.featureItem}>✓ All conversation vibes & tones</Text>
            <Text style={styles.featureItem}>✓ Personality profiles & memory</Text>
            <Text style={styles.featureItem}>✓ Real-time Sentiment Pulse</Text>
          </View>
        </TouchableOpacity>

        {/* Pro Plan ($12.99) */}
        <TouchableOpacity
          style={[styles.planCard, selectedPlan === 'pro' && styles.planCardActive]}
          onPress={() => setSelectedPlan('pro')}
          activeOpacity={0.85}
        >
          <View style={styles.cardTop}>
            <View>
              <Text style={styles.planName}>Pro</Text>
              <Text style={styles.planSub}>Advanced conversation coach</Text>
            </View>
            <Text style={styles.price}>
              $12.99<Text style={styles.perMonth}>/mo</Text>
            </Text>
          </View>

          <View style={styles.featuresList}>
            <Text style={styles.featureItem}>✓ Everything in Plus</Text>
            <Text style={styles.featureItem}>✓ Unlimited personality profiles</Text>
            <Text style={styles.featureItem}>✓ Long-term relationship memory</Text>
            <Text style={styles.featureItem}>✓ Dialog branch prediction simulator</Text>
            <Text style={styles.featureItem}>✓ Priority AI response speed</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* CTA Button */}
      <TouchableOpacity
        style={styles.subscribeBtn}
        onPress={() => onUpgrade(selectedPlan)}
        activeOpacity={0.88}
      >
        <Text style={styles.subscribeBtnText}>
          Upgrade to {selectedPlan.toUpperCase()}
        </Text>
      </TouchableOpacity>

      <Text style={styles.guaranteeText}>Cancel anytime. 7-day refund guarantee.</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 16,
    paddingBottom: 110,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.zinc900,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 9999,
    gap: 4,
    marginBottom: 10,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Palette.zinc900,
    letterSpacing: -0.4,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: Palette.zinc500,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  cardsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    position: 'relative',
    ...ThemeShadows.sm,
  },
  planCardActive: {
    borderColor: Palette.zinc900,
    backgroundColor: '#fafafa',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: Palette.zinc900,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  popularText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#ffffff',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  planName: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.zinc900,
  },
  planSub: {
    fontSize: 12,
    color: Palette.zinc500,
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
    color: Palette.zinc900,
  },
  perMonth: {
    fontSize: 12,
    color: Palette.zinc400,
    fontWeight: '400',
  },
  featuresList: {
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 12,
  },
  featureItem: {
    fontSize: 13,
    color: Palette.zinc700,
    fontWeight: '500',
  },
  subscribeBtn: {
    backgroundColor: Palette.zinc900,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
    ...ThemeShadows.sm,
  },
  subscribeBtnText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#ffffff',
  },
  guaranteeText: {
    fontSize: 11,
    color: Palette.zinc400,
    textAlign: 'center',
  },
});
