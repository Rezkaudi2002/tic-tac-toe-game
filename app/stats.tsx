import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useAnimatedStyle,
  withTiming,
  useSharedValue,
  withDelay,
} from 'react-native-reanimated';

import { useGameStore, GameResult } from '@/stores/game-store';
import { themes } from '@/constants/themes';
import { IconButton } from '@/components/button';

export default function StatsScreen() {
  const router = useRouter();
  const { settings, statistics, gameHistory, points } = useGameStore();
  const currentTheme = themes[settings.themeId] || themes.neonNights;

  const winRate = statistics.totalGames > 0
    ? Math.round((statistics.wins / statistics.totalGames) * 100)
    : 0;

  const avgMoves = statistics.totalGames > 0
    ? Math.round(statistics.totalMoves / statistics.totalGames)
    : 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      <View style={styles.header}>
        <IconButton
          icon={<Ionicons name="close" size={24} color={currentTheme.colors.text} />}
          onPress={() => router.back()}
        />
        <Text style={[styles.headerTitle, { color: currentTheme.colors.text }]}>
          Statistics
        </Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Points Card */}
        <View
          style={[
            styles.pointsCard,
            { backgroundColor: currentTheme.colors.surface, borderRadius: currentTheme.borderRadius.large },
          ]}
        >
          <Text style={styles.pointsIcon}>⭐</Text>
          <Text style={[styles.pointsValue, { color: currentTheme.colors.primary }]}>
            {points}
          </Text>
          <Text style={[styles.pointsLabel, { color: currentTheme.colors.textSecondary }]}>
            Total Points
          </Text>
        </View>

        {/* Main Stats */}
        <View style={styles.statsGrid}>
          <StatCard
            value={statistics.totalGames}
            label="Games Played"
            icon="🎮"
            theme={currentTheme}
          />
          <StatCard
            value={`${winRate}%`}
            label="Win Rate"
            icon="📊"
            theme={currentTheme}
          />
          <StatCard
            value={statistics.wins}
            label="Wins"
            icon="🏆"
            theme={currentTheme}
            color={currentTheme.colors.success}
          />
          <StatCard
            value={statistics.losses}
            label="Losses"
            icon="😔"
            theme={currentTheme}
            color={currentTheme.colors.error}
          />
          <StatCard
            value={statistics.draws}
            label="Draws"
            icon="🤝"
            theme={currentTheme}
            color={currentTheme.colors.warning}
          />
          <StatCard
            value={statistics.bestStreak}
            label="Best Streak"
            icon="🔥"
            theme={currentTheme}
          />
        </View>

        {/* AI Stats */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
            AI Victories
          </Text>
          <View style={styles.aiStatsGrid}>
            <AIStatBar
              difficulty="Easy"
              wins={statistics.aiWins.easy}
              color="#22c55e"
              theme={currentTheme}
            />
            <AIStatBar
              difficulty="Medium"
              wins={statistics.aiWins.medium}
              color="#f59e0b"
              theme={currentTheme}
            />
            <AIStatBar
              difficulty="Hard"
              wins={statistics.aiWins.hard}
              color="#ef4444"
              theme={currentTheme}
            />
            <AIStatBar
              difficulty="Impossible"
              wins={statistics.aiWins.impossible}
              color="#8b5cf6"
              theme={currentTheme}
            />
          </View>
        </View>

        {/* More Stats */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
            Performance
          </Text>
          <View
            style={[
              styles.performanceCard,
              { backgroundColor: currentTheme.colors.surface, borderRadius: currentTheme.borderRadius.medium },
            ]}
          >
            <PerformanceStat
              label="Average Moves"
              value={avgMoves.toString()}
              icon="↔️"
              theme={currentTheme}
            />
            <View style={[styles.divider, { backgroundColor: currentTheme.colors.border }]} />
            <PerformanceStat
              label="Fastest Win"
              value={statistics.fastestWin && statistics.fastestWin !== Infinity ? `${(statistics.fastestWin / 1000).toFixed(1)}s` : '--'}
              icon="⚡"
              theme={currentTheme}
            />
            <View style={[styles.divider, { backgroundColor: currentTheme.colors.border }]} />
            <PerformanceStat
              label="Current Streak"
              value={statistics.currentStreak.toString()}
              icon="🎯"
              theme={currentTheme}
            />
          </View>
        </View>

        {/* Recent Games */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
            Recent Games
          </Text>
          {gameHistory.length === 0 ? (
            <View
              style={[
                styles.emptyHistory,
                { backgroundColor: currentTheme.colors.surface, borderRadius: currentTheme.borderRadius.medium },
              ]}
            >
              <Text style={[styles.emptyText, { color: currentTheme.colors.textSecondary }]}>
                No games played yet
              </Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {gameHistory.slice(0, 5).map((game, index) => (
                <GameHistoryItem key={game.id} game={game} theme={currentTheme} index={index} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Stat Card Component
interface StatCardProps {
  value: string | number;
  label: string;
  icon: string;
  theme: any;
  color?: string;
}

function StatCard({ value, label, icon, theme, color }: StatCardProps) {
  return (
    <View
      style={[
        styles.statCard,
        { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.medium },
      ]}
    >
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color: color || theme.colors.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

// AI Stat Bar Component
interface AIStatBarProps {
  difficulty: string;
  wins: number;
  color: string;
  theme: any;
}

function AIStatBar({ difficulty, wins, color, theme }: AIStatBarProps) {
  const width = useSharedValue(0);
  const maxWins = 10;

  React.useEffect(() => {
    width.value = withDelay(300, withTiming(Math.min(wins / maxWins, 1) * 100, { duration: 800 }));
  }, [wins]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${width.value}%`,
  }));

  return (
    <View style={styles.aiStatRow}>
      <Text style={[styles.aiStatLabel, { color: theme.colors.textSecondary }]}>{difficulty}</Text>
      <View style={[styles.aiStatBarBg, { backgroundColor: theme.colors.surfaceLight }]}>
        <Animated.View style={[styles.aiStatBarFill, barStyle, { backgroundColor: color }]} />
      </View>
      <Text style={[styles.aiStatValue, { color: theme.colors.text }]}>{wins}</Text>
    </View>
  );
}

// Performance Stat Component
interface PerformanceStatProps {
  label: string;
  value: string;
  icon: string;
  theme: any;
}

function PerformanceStat({ label, value, icon, theme }: PerformanceStatProps) {
  return (
    <View style={styles.performanceStat}>
      <Text style={styles.performanceIcon}>{icon}</Text>
      <Text style={[styles.performanceValue, { color: theme.colors.text }]}>{value}</Text>
      <Text style={[styles.performanceLabel, { color: theme.colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

// Game History Item Component
interface GameHistoryItemProps {
  game: GameResult;
  theme: any;
  index: number;
}

function GameHistoryItem({ game, theme, index }: GameHistoryItemProps) {
  // Derive result from winner property
  const getResult = (): 'win' | 'loss' | 'draw' => {
    if (game.winner === 'draw') return 'draw';
    if (game.winner === game.playerSymbol) return 'win';
    return 'loss';
  };

  const result = getResult();

  const resultColors = {
    win: theme.colors.success,
    loss: theme.colors.error,
    draw: theme.colors.warning,
  };

  const resultIcons = {
    win: '🏆',
    loss: '❌',
    draw: '🤝',
  };

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  React.useEffect(() => {
    opacity.value = withDelay(index * 100, withTiming(1, { duration: 300 }));
    translateY.value = withDelay(index * 100, withTiming(0, { duration: 300 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.historyItem,
        animatedStyle,
        { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.small },
      ]}
    >
      <Text style={styles.historyIcon}>{resultIcons[result]}</Text>
      <View style={styles.historyContent}>
        <Text style={[styles.historyResult, { color: resultColors[result] }]}>
          {result.charAt(0).toUpperCase() + result.slice(1)}
        </Text>
        <Text style={[styles.historyDetail, { color: theme.colors.textSecondary }]}>
          {game.mode === 'ai' ? `vs AI (${game.difficulty})` : 'Local Game'} • {game.moves} moves
        </Text>
      </View>
      <Text style={[styles.historyDuration, { color: theme.colors.textSecondary }]}>
        {Math.round(game.duration / 1000)}s
      </Text>
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
  pointsCard: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  pointsIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  pointsValue: {
    fontSize: 48,
    fontWeight: '800',
  },
  pointsLabel: {
    fontSize: 14,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    width: '31%',
    padding: 16,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  aiStatsGrid: {
    gap: 12,
  },
  aiStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  aiStatLabel: {
    width: 80,
    fontSize: 13,
    fontWeight: '500',
  },
  aiStatBarBg: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  aiStatBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  aiStatValue: {
    width: 30,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  performanceCard: {
    flexDirection: 'row',
    padding: 16,
  },
  performanceStat: {
    flex: 1,
    alignItems: 'center',
  },
  performanceIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  performanceValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  performanceLabel: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  divider: {
    width: 1,
    marginHorizontal: 12,
  },
  emptyHistory: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  historyList: {
    gap: 8,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  historyIcon: {
    fontSize: 24,
  },
  historyContent: {
    flex: 1,
  },
  historyResult: {
    fontSize: 14,
    fontWeight: '600',
  },
  historyDetail: {
    fontSize: 12,
    marginTop: 2,
  },
  historyDuration: {
    fontSize: 12,
  },
});