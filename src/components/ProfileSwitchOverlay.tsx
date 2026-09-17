import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Palette } from '../theme/colors';
import { TargetProfileModel } from '../domain/index';
import { useApp } from '../context/AppContext';

/**
 * Watches the active profile reactively (rather than being called at each
 * selectProfile() call site) so it fires no matter where the switch
 * originated — TopBar's switcher, ProfileManagerScreen, etc.
 */
export const ProfileSwitchOverlay: React.FC = () => {
  const { activeProfile } = useApp();
  const prevProfileRef = useRef<TargetProfileModel>(activeProfile);
  const [switchOverlay, setSwitchOverlay] = useState<{
    from: TargetProfileModel;
    to: TargetProfileModel;
  } | null>(null);
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const beamAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const prev = prevProfileRef.current;
    prevProfileRef.current = activeProfile;
    if (prev.id === activeProfile.id) return;

    setSwitchOverlay({ from: prev, to: activeProfile });
    overlayAnim.setValue(0);
    beamAnim.setValue(0);

    const loopAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(beamAnim, {
          toValue: 1,
          duration: 850,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(beamAnim, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
      { iterations: 4 }
    );

    loopAnimation.start();

    Animated.sequence([
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.delay(3000),
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 320,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      loopAnimation.stop();
      setSwitchOverlay(null);
    });
  }, [activeProfile, overlayAnim, beamAnim]);

  if (!switchOverlay) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.switchOverlayContainer, { opacity: overlayAnim }]}
    >
      <Animated.View
        style={[
          styles.switchOverlayCard,
          {
            transform: [
              {
                scale: overlayAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.85, 1],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.switchBadgeRow}>
          <Feather name="zap" size={14} color="#db2777" />
          <Text style={styles.switchBadgeText}>SWITCHING PROFILE</Text>
        </View>

        <View style={styles.switchProfilesRow}>
          <View style={styles.switchProfileCol}>
            <View style={styles.switchAvatarBox}>
              <Text style={styles.switchEmoji}>{switchOverlay.from.avatarEmoji || '❤️'}</Text>
            </View>
            <Text style={styles.switchName} numberOfLines={1}>
              {switchOverlay.from.name}
            </Text>
          </View>

          <View style={styles.beamTrackContainer}>
            <View style={styles.beamLineBase} />
            <Animated.View
              style={[
                styles.glowingLightBeam,
                {
                  transform: [
                    {
                      translateX: beamAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-26, 26],
                      }),
                    },
                    {
                      scale: beamAnim.interpolate({
                        inputRange: [0, 0.5, 1],
                        outputRange: [0.6, 1.3, 0.6],
                      }),
                    },
                  ],
                  opacity: beamAnim.interpolate({
                    inputRange: [0, 0.2, 0.8, 1],
                    outputRange: [0, 1, 1, 0],
                  }),
                },
              ]}
            />
            <Feather name="chevron-right" size={22} color="#ec4899" />
          </View>

          <View style={styles.switchProfileCol}>
            <View style={[styles.switchAvatarBox, styles.switchAvatarActive]}>
              <Text style={styles.switchEmoji}>{switchOverlay.to.avatarEmoji || '❤️'}</Text>
            </View>
            <Text style={[styles.switchName, styles.switchNameActive]} numberOfLines={1}>
              {switchOverlay.to.name}
            </Text>
          </View>
        </View>

        <Text style={styles.switchSubText}>
          Wingman is now tuned for{' '}
          <Text style={{ color: Palette.zinc900, fontWeight: '800' }}>{switchOverlay.to.name}</Text> (
          {switchOverlay.to.relationship})
        </Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  switchOverlayContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(9, 9, 11, 0.78)',
    paddingHorizontal: 20,
    zIndex: 99999,
  },
  switchOverlayCard: {
    backgroundColor: '#ffffff',
    borderRadius: 28,
    paddingHorizontal: 26,
    paddingVertical: 28,
    width: '92%',
    maxWidth: 360,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 2,
    borderWidth: 1.5,
    borderColor: '#e2e8f0',
  },
  switchBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#fdf2f8',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    marginBottom: 20,
  },
  switchBadgeText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#db2777',
    letterSpacing: 1,
  },
  switchProfilesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
  },
  switchProfileCol: {
    alignItems: 'center',
    width: 76,
  },
  switchAvatarBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f4f4f5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  switchAvatarActive: {
    backgroundColor: '#fdf2f8',
    borderWidth: 2.5,
    borderColor: '#ec4899',
    shadowColor: '#ec4899',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 2,
  },
  switchEmoji: {
    fontSize: 28,
  },
  switchName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#71717a',
  },
  switchNameActive: {
    color: '#09090b',
    fontWeight: '800',
  },
  beamTrackContainer: {
    width: 68,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  beamLineBase: {
    position: 'absolute',
    width: 54,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#f1f5f9',
  },
  glowingLightBeam: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#ec4899',
    borderWidth: 2,
    borderColor: '#fbcfe8',
  },
  switchSubText: {
    fontSize: 13,
    color: Palette.zinc500,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 18,
  },
});
