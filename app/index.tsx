import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  withDelay,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useGameStore } from '@/stores/game-store';
import { Button } from '@/components/button';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const theme = useGameStore((state) => state.getTheme());
  const symbolStyle = useGameStore((state) => state.getSymbolStyle());
  const { statistics, dailyChallenge, points, setPhase } = useGameStore();

  const logoScale = useSharedValue(1);
  const logoGlow = useSharedValue(0.5);
  const card1Translate = useSharedValue(50);
  const card2Translate = useSharedValue(50);
  const card3Translate = useSharedValue(50);

  useEffect(() => {
    // Logo pulse
    logoScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1
    );

    logoGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0.5, { duration: 2000 })
      ),
      -1
    );

    // Staggered card entrance
    card1Translate.value = withDelay(100, withSpring(0, { damping: 15 }));
    card2Translate.value = withDelay(200, withSpring(0, { damping: 15 }));
    card3Translate.value = withDelay(300, withSpring(0, { damping: 15 }));
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: logoGlow.value,
  }));

  const card1Style = useAnimatedStyle(() => ({
    transform: [{ translateY: card1Translate.value }],
    opacity: 1 - card1Translate.value / 50,
  }));

  const card2Style = useAnimatedStyle(() => ({
    transform: [{ translateY: card2Translate.value }],
    opacity: 1 - card2Translate.value / 50,
  }));

  const card3Style = useAnimatedStyle(() => ({
    transform: [{ translateY: card3Translate.value }],
    opacity: 1 - card3Translate.value / 50,
  }));

  const handlePlayAI = () => {
    setPhase('setup');
    router.push('/game');
  };

  const handlePlayLocal = () => {
    setPhase('playing');
    router.push('/game?mode=local');
  };

  const getDailyChallengeText = () => {
    if (!dailyChallenge) return 'Loading...';
    switch (dailyChallenge.type) {
      case 'win_streak':
        return `Win ${dailyChallenge.target} games in a row`;
      case 'no_loss':
        return `Play ${dailyChallenge.target} games without losing`;
      case 'fast_win':
        return 'Win a game in under 15 seconds';
      case 'beat_ai':
        return `Beat AI on ${dailyChallenge.difficulty} difficulty`;
      default:
        return 'Complete today\'s challenge';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Animated.View style={[styles.glowContainer, glowStyle]}>
            <View
              style={[
                styles.glow,
                { backgroundColor: theme.colors.primary },
              ]}
            />
          </Animated.View>
          <Animated.View style={[styles.logo, logoStyle]}>
            <View style={styles.logoGrid}>
              <View
                style={[
                  styles.logoCell,
                  { backgroundColor: theme.colors.surface },
                ]}
              >
                <Text style={[styles.logoSymbol, { color: theme.colors.playerX }]}>
                  {symbolStyle.x}
                </Text>
              </View>
              <View
                style={[
                  styles.logoCell,
                  { backgroundColor: theme.colors.surface },
                ]}
              >
                <Text style={[styles.logoSymbol, { color: theme.colors.playerO }]}>
                  {symbolStyle.o}
                </Text>
              </View>
              <View
                style={[
                  styles.logoCell,
                  { backgroundColor: theme.colors.surface },
                ]}
              >
                <Text style={[styles.logoSymbol, { color: theme.colors.playerX }]}>
                  {symbolStyle.x}
                </Text>
              </View>
              <View
                style={[
                  styles.logoCell,
                  { backgroundColor: theme.colors.surface },
                ]}
              >
                <Text style={[styles.logoSymbol, { color: theme.colors.playerO }]}>
                  {symbolStyle.o}
                </Text>
              </View>
            </View>
          </Animated.View>
          <Text style={[styles.title, { color: theme.colors.text }]}>
            Tic Tac Toe
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            The Classic Game, Reimagined
          </Text>
        </View>

        {/* Quick Stats */}
        <View
          style={[
            styles.quickStats,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.medium,
            },
          ]}
        >
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.success }]}>
              {statistics.wins}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
              Wins
            </Text>
          </View>
          <View
            style={[styles.statDivider, { backgroundColor: theme.colors.border }]}
          />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.warning }]}>
              {statistics.bestStreak}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
              Best Streak
            </Text>
          </View>
          <View
            style={[styles.statDivider, { backgroundColor: theme.colors.border }]}
          />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.colors.accent }]}>
              {points}
            </Text>
            <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
              Points
            </Text>
          </View>
        </View>

        {/* Daily Challenge */}
        {dailyChallenge && (
          <Animated.View
            style={[
              styles.dailyChallenge,
              card1Style,
              {
                backgroundColor: theme.colors.surface,
                borderRadius: theme.borderRadius.large,
                borderLeftWidth: 4,
                borderLeftColor: dailyChallenge.completed
                  ? theme.colors.success
                  : theme.colors.primary,
              },
            ]}
          >
            <View style={styles.dailyHeader}>
              <Text style={[styles.dailyTitle, { color: theme.colors.text }]}>
                📅 Daily Challenge
              </Text>
              <Text style={[styles.dailyReward, { color: theme.colors.accent }]}>
                +{dailyChallenge.reward} pts
              </Text>
            </View>
            <Text
              style={[styles.dailyDescription, { color: theme.colors.textSecondary }]}
            >
              {getDailyChallengeText()}
            </Text>
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progressBar,
                  { backgroundColor: theme.colors.surfaceLight },
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: dailyChallenge.completed
                        ? theme.colors.success
                        : theme.colors.primary,
                      width: `${Math.min(
                        (dailyChallenge.progress / dailyChallenge.target) * 100,
                        100
                      )}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressText, { color: theme.colors.textMuted }]}>
                {dailyChallenge.progress}/{dailyChallenge.target}
              </Text>
            </View>
          </Animated.View>
        )}

        {/* Game Modes */}
        <Animated.View style={[styles.gameModes, card2Style]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
            Play Now
          </Text>

          <Pressable
            onPress={handlePlayAI}
            style={({ pressed }) => [
              styles.gameModeCard,
              {
                backgroundColor: theme.colors.surface,
                borderRadius: theme.borderRadius.large,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            <View
              style={[
                styles.gameModeIcon,
                { backgroundColor: `${theme.colors.primary}20` },
              ]}
            >
              <Ionicons name="hardware-chip" size={32} color={theme.colors.primary} />
            </View>
            <View style={styles.gameModeText}>
              <Text style={[styles.gameModeName, { color: theme.colors.text }]}>
                vs AI
              </Text>
              <Text
                style={[
                  styles.gameModeDescription,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Challenge the computer
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={theme.colors.textMuted}
            />
          </Pressable>

          <Pressable
            onPress={handlePlayLocal}
            style={({ pressed }) => [
              styles.gameModeCard,
              {
                backgroundColor: theme.colors.surface,
                borderRadius: theme.borderRadius.large,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            <View
              style={[
                styles.gameModeIcon,
                { backgroundColor: `${theme.colors.secondary}20` },
              ]}
            >
              <Ionicons name="people" size={32} color={theme.colors.secondary} />
            </View>
            <View style={styles.gameModeText}>
              <Text style={[styles.gameModeName, { color: theme.colors.text }]}>
                2 Players
              </Text>
              <Text
                style={[
                  styles.gameModeDescription,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Play with a friend
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={theme.colors.textMuted}
            />
          </Pressable>

          {/* Coming Soon Modes */}
          <View
            style={[
              styles.gameModeCard,
              styles.comingSoon,
              {
                backgroundColor: theme.colors.surface,
                borderRadius: theme.borderRadius.large,
                opacity: 0.6,
              },
            ]}
          >
            <View
              style={[
                styles.gameModeIcon,
                { backgroundColor: `${theme.colors.accent}20` },
              ]}
            >
              <Ionicons name="globe" size={32} color={theme.colors.accent} />
            </View>
            <View style={styles.gameModeText}>
              <Text style={[styles.gameModeName, { color: theme.colors.text }]}>
                Online
              </Text>
              <Text
                style={[
                  styles.gameModeDescription,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Coming soon...
              </Text>
            </View>
            <View
              style={[
                styles.comingSoonBadge,
                { backgroundColor: theme.colors.accent },
              ]}
            >
              <Text style={styles.comingSoonText}>Soon</Text>
            </View>
          </View>
        </Animated.View>

        {/* Bottom Navigation */}
        <Animated.View style={[styles.bottomNav, card3Style]}>
          <Pressable
            onPress={() => router.push('/stats')}
            style={({ pressed }) => [
              styles.navButton,
              {
                backgroundColor: theme.colors.surface,
                borderRadius: theme.borderRadius.medium,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              },
            ]}
          >
            <Ionicons name="stats-chart" size={24} color={theme.colors.primary} />
            <Text style={[styles.navLabel, { color: theme.colors.textSecondary }]}>
              Stats
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/achievements')}
            style={({ pressed }) => [
              styles.navButton,
              {
                backgroundColor: theme.colors.surface,
                borderRadius: theme.borderRadius.medium,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              },
            ]}
          >
            <Ionicons name="trophy" size={24} color={theme.colors.warning} />
            <Text style={[styles.navLabel, { color: theme.colors.textSecondary }]}>
              Awards
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/themes')}
            style={({ pressed }) => [
              styles.navButton,
              {
                backgroundColor: theme.colors.surface,
                borderRadius: theme.borderRadius.medium,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              },
            ]}
          >
            <Ionicons name="color-palette" size={24} color={theme.colors.secondary} />
            <Text style={[styles.navLabel, { color: theme.colors.textSecondary }]}>
              Themes
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push('/settings')}
            style={({ pressed }) => [
              styles.navButton,
              {
                backgroundColor: theme.colors.surface,
                borderRadius: theme.borderRadius.medium,
                transform: [{ scale: pressed ? 0.95 : 1 }],
              },
            ]}
          >
            <Ionicons name="settings" size={24} color={theme.colors.textMuted} />
            <Text style={[styles.navLabel, { color: theme.colors.textSecondary }]}>
              Settings
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 20,
  },
  glowContainer: {
    position: 'absolute',
    top: 0,
  },
  glow: {
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.3,
  },
  logo: {
    marginBottom: 16,
  },
  logoGrid: {
    width: 100,
    height: 100,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  logoCell: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoSymbol: {
    fontSize: 24,
    fontWeight: '700',
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  quickStats: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 20,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    marginHorizontal: 8,
  },
  dailyChallenge: {
    padding: 16,
    marginBottom: 24,
  },
  dailyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dailyTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  dailyReward: {
    fontSize: 14,
    fontWeight: '700',
  },
  dailyDescription: {
    fontSize: 14,
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    width: 40,
    textAlign: 'right',
  },
  gameModes: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  gameModeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
  gameModeIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  gameModeText: {
    flex: 1,
  },
  gameModeName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  gameModeDescription: {
    fontSize: 14,
  },
  comingSoon: {},
  comingSoonBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  comingSoonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  bottomNav: {
    flexDirection: 'row',
    gap: 12,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    gap: 4,
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});
