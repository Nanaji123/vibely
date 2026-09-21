import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Modal, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { Palette } from '../theme/colors';
import { ThemeShadows } from '../theme/shadows';
import { UserSubscriptionModel, PaywallReason, isUnlimited } from '../domain/index';
import { useApp } from '../context/AppContext';

type PlanId = 'plus' | 'pro';

const PLANS: {
  id: PlanId;
  name: string;
  price: string;
  tagline: string;
  badge?: string;
  features: string[];
}[] = [
  {
    id: 'plus',
    name: 'Plus',
    price: '$6.99',
    tagline: 'Everyday wingman',
    badge: 'MOST POPULAR',
    features: ['Unlimited replies & coaching', 'Screenshot chat reader', 'All vibes & tones', 'Conversation Pulse'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$12.99',
    tagline: 'Full conversation coach',
    features: ['Everything in Plus', 'Unlimited people profiles', 'Next-turn predictions', 'Priority AI speed'],
  },
];

interface PaywallProps {
  subscription: UserSubscriptionModel;
  reason?: PaywallReason;
  onUpgrade: (plan: PlanId) => void;
  onClose?: () => void;
}

const COPY: Record<PaywallReason, { title: string; sub: string }> = {
  messages: { title: "You've used your free replies", sub: 'Go unlimited to keep the conversation moving.' },
  chats: { title: "You've used your free chats", sub: 'Unlimited chats with everyone you’re texting.' },
  profiles: { title: 'Add more people', sub: 'Your plan has hit its people limit. Upgrade to add more.' },
  upsell: { title: 'Never get stuck on what to say', sub: 'Unlimited replies, screenshot reading and next-turn predictions.' },
};

// Sheet body: usable inside the modal below or on its own
export const PaywallScreen: React.FC<PaywallProps> = ({ subscription, reason = 'upsell', onUpgrade, onClose }) => {
  const paid = isUnlimited(subscription);
  const [selectedPlan, setSelectedPlan] = useState<PlanId>(subscription.plan === 'plus' ? 'pro' : 'plus');
  const copy = COPY[reason];
  const meters = [
    subscription.messagesLimit !== null && { label: 'replies', used: subscription.messagesUsed, limit: subscription.messagesLimit },
    subscription.chatsLimit !== null && { label: 'chats', used: subscription.chatsUsed, limit: subscription.chatsLimit },
  ].filter(Boolean) as { label: string; used: number; limit: number }[];

  return (
    <View style={styles.sheet}>
      <LinearGradient colors={['#18181b', '#312e81']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroBadge}>
            <Feather name="zap" size={11} color="#ffffff" />
            <Text style={styles.heroBadgeText}>VIBELY PRO</Text>
          </View>
          {onClose ? (
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={10} accessibilityLabel="Close">
              <Feather name="x" size={18} color="#ffffff" />
            </TouchableOpacity>
          ) : null}
        </View>
        <Text style={styles.heroTitle}>{paid && reason === 'upsell' ? `You're on Vibely ${subscription.plan === 'pro' ? 'Pro' : 'Plus'}` : copy.title}</Text>
        <Text style={styles.heroSub}>{paid && reason === 'upsell' ? 'Unlimited replies and chats. Thanks for the support.' : copy.sub}</Text>

        {meters.length > 0 ? (
          <View style={styles.meters}>
            {meters.map((m) => (
              <View key={m.label} style={styles.meter}>
                <View style={styles.meterTrack}>
                  <View style={[styles.meterFill, { width: `${Math.min(100, (m.used / m.limit) * 100)}%` }]} />
                </View>
                <Text style={styles.meterText}>
                  {Math.min(m.used, m.limit)} of {m.limit} free {m.label} used
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </LinearGradient>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} bounces={false}>
        {PLANS.map((plan) => {
          const current = subscription.plan === plan.id;
          const active = selectedPlan === plan.id && !current;
          return (
            <TouchableOpacity
              key={plan.id}
              style={[styles.planCard, active && styles.planCardActive, current && styles.planCardCurrent]}
              onPress={() => !current && setSelectedPlan(plan.id)}
              activeOpacity={current ? 1 : 0.9}
            >
              <View style={styles.planTop}>
                <View style={styles.planRadio}>
                  <View style={[styles.radioOuter, active && styles.radioOuterActive]}>
                    {active ? <View style={styles.radioInner} /> : null}
                  </View>
                  <View>
                    <View style={styles.planNameRow}>
                      <Text style={styles.planName}>{plan.name}</Text>
                      {current ? (
                        <View style={[styles.popularBadge, styles.currentBadge]}>
                          <Text style={styles.popularText}>CURRENT</Text>
                        </View>
                      ) : plan.badge ? (
                        <View style={styles.popularBadge}>
                          <Text style={styles.popularText}>{plan.badge}</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={styles.planTagline}>{plan.tagline}</Text>
                  </View>
                </View>
                <Text style={styles.price}>
                  {plan.price}
                  <Text style={styles.perMonth}>/mo</Text>
                </Text>
              </View>
              <View style={styles.features}>
                {plan.features.map((f) => (
                  <View key={f} style={styles.featureRow}>
                    <Feather name="check" size={13} color={active ? Palette.indigo600 : Palette.zinc500} />
                    <Text style={styles.featureText}>{f}</Text>
                  </View>
                ))}
              </View>
            </TouchableOpacity>
          );
        })}

        {subscription.plan !== 'pro' ? (
          <TouchableOpacity style={styles.cta} onPress={() => onUpgrade(selectedPlan)} activeOpacity={0.88}>
            <Text style={styles.ctaText}>
              {subscription.plan === 'plus' ? 'Upgrade to Pro' : `Continue with ${selectedPlan === 'plus' ? 'Plus' : 'Pro'}`}
            </Text>
            <Feather name="arrow-right" size={16} color="#ffffff" />
          </TouchableOpacity>
        ) : null}
        {onClose ? (
          <TouchableOpacity onPress={onClose} style={styles.laterBtn} activeOpacity={0.7}>
            <Text style={styles.laterText}>{reason === 'upsell' ? 'Maybe later' : 'Not now'}</Text>
          </TouchableOpacity>
        ) : null}
        <Text style={styles.fineprint}>Cancel anytime · 7-day refund guarantee</Text>
      </ScrollView>
    </View>
  );
};

// Mounted once at the app root so the paywall can appear over any screen
export const PaywallSheet: React.FC = () => {
  const { paywallVisible, paywallReason, hidePaywall, subscription, upgradePlan } = useApp();
  return (
    <Modal visible={paywallVisible} animationType="slide" transparent onRequestClose={hidePaywall}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={hidePaywall} />
        <PaywallScreen subscription={subscription} reason={paywallReason} onUpgrade={(plan) => upgradePlan(plan)} onClose={hidePaywall} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(9,9,11,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    maxHeight: '92%',
    ...ThemeShadows.lg,
  },
  hero: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 22,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  heroBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
  meters: {
    marginTop: 18,
    gap: 12,
  },
  meter: {
    gap: 8,
  },
  meterTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.18)',
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 3,
  },
  meterText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '600',
  },
  body: {
    flexGrow: 0,
  },
  bodyContent: {
    padding: 18,
    paddingBottom: 34,
    gap: 12,
  },
  planCard: {
    borderWidth: 1.5,
    borderColor: Palette.zinc200,
    borderRadius: 20,
    padding: 16,
    backgroundColor: '#ffffff',
  },
  planCardActive: {
    borderColor: Palette.zinc900,
    backgroundColor: Palette.zinc50,
  },
  planCardCurrent: {
    opacity: 0.6,
  },
  currentBadge: {
    backgroundColor: Palette.emerald600,
  },
  planTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  planRadio: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Palette.zinc200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: Palette.zinc900,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Palette.zinc900,
  },
  planNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planName: {
    fontSize: 17,
    fontWeight: '800',
    color: Palette.zinc900,
  },
  popularBadge: {
    backgroundColor: Palette.indigo600,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 999,
  },
  popularText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.6,
  },
  planTagline: {
    fontSize: 12,
    color: Palette.zinc500,
    marginTop: 2,
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
    color: Palette.zinc900,
    letterSpacing: -0.5,
  },
  perMonth: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.zinc500,
  },
  features: {
    marginTop: 12,
    gap: 6,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 13,
    color: Palette.zinc700,
    fontWeight: '500',
  },
  cta: {
    marginTop: 6,
    height: 54,
    borderRadius: 16,
    backgroundColor: Palette.zinc900,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...ThemeShadows.md,
  },
  ctaText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  laterBtn: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  laterText: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.zinc500,
  },
  fineprint: {
    textAlign: 'center',
    fontSize: 11,
    color: Palette.zinc400,
  },
});
