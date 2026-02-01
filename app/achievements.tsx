import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { useGameStore, Achievement } from '@/stores/game-store';
import { themes } from '@/constants/themes';
import { IconButton } from '@/components/button';

// Achievement definitions with icons and descriptions
const achievementDetails: Record<string, { icon: string; title: string; description: string; maxProgress?: number }> = {
  first_win: { icon: '🎉', title: 'First Victory', description: 'Win your first game' },
  streak_3: { icon: '🔥', title: 'Hot Streak', description: 'Win 3 games in a row', maxProgress: 3 },
  streak_5: { icon: '💥', title: 'On Fire', description: 'Win 5 games in a row', maxProgress: 5 },
  streak_10: { icon: '⚡', title: 'Unstoppable', description: 'Win 10 games in a row', maxProgress: 10 },
  games_10: { icon: '🎮', title: 'Getting Started', description: 'Play 10 games', maxProgress: 10 },
  games_50: { icon: '🎯', title: 'Dedicated', description: 'Play 50 games', maxProgress: 50 },
  games_100: { icon: '👑', title: 'Master Player', description: 'Play 100 games', maxProgress: 100 },
  beat_easy: { icon: '🌱', title: 'Baby Steps', description: 'Beat AI on Easy' },
  beat_medium: { icon: '⭐', title: 'Rising Star', description: 'Beat AI on Medium' },
  beat_hard: { icon: '💪', title: 'Challenger', description: 'Beat AI on Hard' },
  beat_impossible: { icon: '🏅', title: 'Legend', description: 'Beat AI on Impossible' },
  speed_demon: { icon: '⏱️', title: 'Speed Demon', description: 'Win in under 10 seconds' },
  daily_3: { icon: '📅', title: 'Daily Warrior', description: 'Complete 3 daily challenges', maxProgress: 3 },
  daily_7: { icon: '🗓️', title: 'Weekly Champion', description: 'Complete 7 daily challenges', maxProgress: 7 },
  perfectionist: { icon: '💎', title: 'Perfectionist', description: 'Win 10 games without a loss', maxProgress: 10 },
};

export default function AchievementsScreen() {
  const router = useRouter();
  const { settings, achievements, statistics } = useGameStore();
  const currentTheme = themes[settings.themeId] || themes.neonNights;

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      <View style={styles.header}>
        <IconButton
          icon={<Ionicons name="close" size={24} color={currentTheme.colors.text} />}
          onPress={() => router.back()}
        />
        <Text style={[styles.headerTitle, { color: currentTheme.colors.text }]}>
          Achievements
        </Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress Overview */}
        <View
          style={[
            styles.progressCard,
            { backgroundColor: currentTheme.colors.surface, borderRadius: currentTheme.borderRadius.large },
          ]}
        >
          <View style={styles.progressHeader}>
            <Text style={styles.trophyIcon}>🏆</Text>
            <View style={styles.progressText}>
              <Text style={[styles.progressCount, { color: currentTheme.colors.text }]}>
                {unlockedCount} / {totalCount}
              </Text>
              <Text style={[styles.progressLabel, { color: currentTheme.colors.textSecondary }]}>
                Achievements Unlocked
              </Text>
            </View>
          </View>
          <View style={[styles.progressBarBg, { backgroundColor: currentTheme.colors.surfaceLight }]}>
            <View
              style={[
                styles.progressBarFill,
                { backgroundColor: currentTheme.colors.primary, width: `${progressPercent}%` },
              ]}
            />
          </View>
          <Text style={[styles.progressPercent, { color: currentTheme.colors.textSecondary }]}>
            {progressPercent}% Complete
          </Text>
        </View>

        {/* Achievements List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
            All Achievements
          </Text>
          <View style={styles.achievementsList}>
            {achievements.map((achievement, index) => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                details={achievementDetails[achievement.id]}
                theme={currentTheme}
                index={index}
                stats={statistics}
              />
            ))}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Achievement Card Component
interface AchievementCardProps {
  achievement: Achievement;
  details: typeof achievementDetails[string];
  theme: any;
  index: number;
  stats: any;
}

function AchievementCard({ achievement, details, theme, index, stats }: AchievementCardProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);
  const isUnlocked = !!achievement.unlocked;

  React.useEffect(() => {
    opacity.value = withDelay(index * 50, withTiming(1, { duration: 300 }));
    translateY.value = withDelay(index * 50, withSpring(0, { damping: 15 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  // Calculate progress for progressive achievements
  let progress = 0;
  let maxProgress = details?.maxProgress || 0;

  if (!isUnlocked && maxProgress > 0) {
    switch (achievement.id) {
      case 'streak_3':
      case 'streak_5':
      case 'streak_10':
        progress = stats.currentStreak;
        break;
      case 'games_10':
      case 'games_50':
      case 'games_100':
        progress = stats.totalGames;
        break;
      case 'daily_3':
      case 'daily_7':
        progress = achievement.progress || 0;
        break;
      case 'perfectionist':
        progress = achievement.progress || 0;
        break;
    }
  }

  return (
    <Animated.View
      style={[
        styles.achievementCard,
        animatedStyle,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.borderRadius.medium,
          opacity: isUnlocked ? 1 : 0.6,
        },
      ]}
    >
      {/* Icon */}
      <View
        style={[
          styles.achievementIcon,
          {
            backgroundColor: isUnlocked ? `${theme.colors.primary}20` : theme.colors.surfaceLight,
          },
        ]}
      >
        <Text style={[styles.iconText, { opacity: isUnlocked ? 1 : 0.4 }]}>
          {details?.icon || '🎖️'}
        </Text>
      </View>

      {/* Content */}
      <View style={styles.achievementContent}>
        <Text
          style={[
            styles.achievementTitle,
            { color: isUnlocked ? theme.colors.text : theme.colors.textSecondary },
          ]}
        >
          {details?.title || achievement.id}
        </Text>
        <Text style={[styles.achievementDescription, { color: theme.colors.textSecondary }]}>
          {details?.description || ''}
        </Text>

        {/* Progress Bar for incomplete progressive achievements */}
        {!isUnlocked && maxProgress > 0 && (
          <View style={styles.achievementProgress}>
            <View style={[styles.progressBarSmallBg, { backgroundColor: theme.colors.surfaceLight }]}>
              <View
                style={[
                  styles.progressBarSmallFill,
                  {
                    backgroundColor: theme.colors.primary,
                    width: `${Math.min((progress / maxProgress) * 100, 100)}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressSmallText, { color: theme.colors.textSecondary }]}>
              {progress}/{maxProgress}
            </Text>
          </View>
        )}
      </View>

      {/* Status */}
      <View style={styles.achievementStatus}>
        {isUnlocked ? (
          <View style={[styles.unlockedBadge, { backgroundColor: theme.colors.success }]}>
            <Ionicons name="checkmark" size={14} color="#fff" />
          </View>
        ) : (
          <Ionicons name="lock-closed" size={18} color={theme.colors.textSecondary} />
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  progressCard: {
    padding: 20,
    marginBottom: 24,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  trophyIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  progressText: {
    flex: 1,
  },
  progressCount: {
    fontSize: 28,
    fontWeight: '800',
  },
  progressLabel: {
    fontSize: 14,
    marginTop: 2,
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 13,
    textAlign: 'right',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  achievementsList: {
    gap: 12,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  achievementIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 24,
  },
  achievementContent: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  achievementDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  achievementProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  progressBarSmallBg: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarSmallFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressSmallText: {
    fontSize: 11,
    fontWeight: '500',
  },
  achievementStatus: {
    width: 32,
    alignItems: 'center',
  },
  unlockedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
