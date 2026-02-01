import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';

import { useGameStore, GameResult, GameMode } from '@/stores/game-store';
import { themes, symbolStyles, SymbolStyleKey } from '@/constants/themes';
import { Difficulty, Player } from '@/constants/game';
import { GameBoard } from '@/components/game-board';
import { GameStatus } from '@/components/game-status';
import { GameResultModal } from '@/components/game-result-modal';
import { Button, IconButton } from '@/components/button';
import { gameHaptics } from '@/utils/audio';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type GamePhase = 'setup' | 'playing';

export default function GameScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ mode: 'ai' | 'local' }>();
  const gameMode = params.mode || 'ai';

  const {
    settings,
    gamePhase,
    winner,
    playerSymbol,
    difficulty,
    startGame,
    resetGame,
    updateStatistics,
    gameStartTime,
    moveCount,
  } = useGameStore();

  const currentTheme = themes[settings.themeId] || themes.neonNights;
  const symbols = symbolStyles[settings.symbolStyleId as SymbolStyleKey] || symbolStyles.classic;
  const isGameOver = gamePhase === 'finished' || winner !== null;

  const [phase, setPhase] = useState<GamePhase>(gameMode === 'ai' ? 'setup' : 'playing');
  const [showResult, setShowResult] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(difficulty);
  const [selectedSymbol, setSelectedSymbol] = useState<Player>('X');

  // Animations
  const setupOpacity = useSharedValue(1);
  const gameOpacity = useSharedValue(0);
  const headerY = useSharedValue(-50);

  useEffect(() => {
    headerY.value = withSpring(0, { damping: 15 });
    
    if (gameMode === 'local') {
      startGame('local');
      gameOpacity.value = withTiming(1, { duration: 300 });
    }
  }, []);

  // Handle game over
  useEffect(() => {
    if (isGameOver && winner !== null) {
      const timer = setTimeout(() => {
        setShowResult(true);
        
        // Calculate result and update stats
        const gameDuration = gameStartTime ? Date.now() - gameStartTime : 0;
        let resultType: 'win' | 'loss' | 'draw' = 'draw';
        
        if (winner !== 'draw') {
          if (gameMode === 'ai') {
            resultType = winner === playerSymbol ? 'win' : 'loss';
          } else {
            resultType = 'win'; // In local mode, someone always wins
          }
        }
        
        const result: GameResult = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          mode: gameMode as GameMode,
          difficulty: gameMode === 'ai' ? difficulty : undefined,
          winner: winner as Player | 'draw',
          playerSymbol: playerSymbol as Player,
          moves: moveCount,
          duration: gameDuration,
        };
        
        updateStatistics(result);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isGameOver, winner]);

  const handleStartGame = useCallback(() => {
    gameHaptics.tap(settings.hapticEnabled);
    setupOpacity.value = withTiming(0, { duration: 200 });
    
    setTimeout(() => {
      startGame('ai', selectedDifficulty, selectedSymbol);
      setPhase('playing');
      gameOpacity.value = withDelay(100, withTiming(1, { duration: 300 }));
    }, 200);
  }, [selectedDifficulty, selectedSymbol, settings.hapticEnabled]);

  const handlePlayAgain = useCallback(() => {
    setShowResult(false);
    resetGame();
  }, []);

  const handleGoHome = useCallback(() => {
    setShowResult(false);
    router.back();
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  const setupStyle = useAnimatedStyle(() => ({
    opacity: setupOpacity.value,
    display: setupOpacity.value === 0 ? 'none' : 'flex',
  }));

  const gameStyle = useAnimatedStyle(() => ({
    opacity: gameOpacity.value,
  }));

  const headerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: headerY.value }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, headerStyle]}>
        <IconButton
          icon={<Ionicons name="arrow-back" size={24} color={currentTheme.colors.text} />}
          onPress={handleBack}
        />
        <Text style={[styles.headerTitle, { color: currentTheme.colors.text }]}>
          {gameMode === 'ai' ? 'vs AI' : 'Local Game'}
        </Text>
        <View style={{ width: 48 }} />
      </Animated.View>

      {/* Setup Phase (AI only) */}
      {phase === 'setup' && gameMode === 'ai' && (
        <Animated.View style={[styles.setupContainer, setupStyle]}>
          {/* Difficulty Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
              Select Difficulty
            </Text>
            <View style={styles.optionGrid}>
              {(['easy', 'medium', 'hard', 'impossible'] as Difficulty[]).map((diff) => (
                <DifficultyCard
                  key={diff}
                  difficulty={diff}
                  selected={selectedDifficulty === diff}
                  onSelect={() => setSelectedDifficulty(diff)}
                  theme={currentTheme}
                />
              ))}
            </View>
          </View>

          {/* Symbol Selection */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
              Choose Your Symbol
            </Text>
            <View style={styles.symbolSelection}>
              <SymbolCard
                symbol="X"
                displaySymbol={symbols.x}
                selected={selectedSymbol === 'X'}
                onSelect={() => setSelectedSymbol('X')}
                theme={currentTheme}
                color={currentTheme.colors.playerX}
              />
              <SymbolCard
                symbol="O"
                displaySymbol={symbols.o}
                selected={selectedSymbol === 'O'}
                onSelect={() => setSelectedSymbol('O')}
                theme={currentTheme}
                color={currentTheme.colors.playerO}
              />
            </View>
            <Text style={[styles.symbolHint, { color: currentTheme.colors.textSecondary }]}>
              {selectedSymbol === 'X' ? 'You go first!' : 'AI goes first'}
            </Text>
          </View>

          {/* Start Button */}
          <View style={styles.startButtonContainer}>
            <Button
              title="Start Game"
              onPress={handleStartGame}
              variant="primary"
              size="large"
              fullWidth
            />
          </View>
        </Animated.View>
      )}

      {/* Game Phase */}
      {phase === 'playing' && (
        <Animated.View style={[styles.gameContainer, gameStyle]}>
          <GameStatus />
          <GameBoard />
          
          {/* Game Controls */}
          <View style={styles.gameControls}>
            <Button
              title="Restart"
              onPress={() => {
                gameHaptics.tap(settings.hapticEnabled);
                resetGame();
              }}
              variant="outline"
              size="medium"
              icon={<Ionicons name="refresh" size={18} color={currentTheme.colors.primary} />}
            />
          </View>
        </Animated.View>
      )}

      {/* Result Modal */}
      <GameResultModal
        visible={showResult}
        onPlayAgain={handlePlayAgain}
        onMainMenu={handleGoHome}
      />
    </SafeAreaView>
  );
}

// Difficulty Card Component
interface DifficultyCardProps {
  difficulty: Difficulty;
  selected: boolean;
  onSelect: () => void;
  theme: any;
}

function DifficultyCard({ difficulty, selected, onSelect, theme }: DifficultyCardProps) {
  const scale = useSharedValue(1);

  const difficultyInfo: Record<Difficulty, { label: string; icon: string; color: string }> = {
    easy: { label: 'Easy', icon: '🌱', color: '#22c55e' },
    medium: { label: 'Medium', icon: '⭐', color: '#f59e0b' },
    hard: { label: 'Hard', icon: '🔥', color: '#ef4444' },
    impossible: { label: 'Impossible', icon: '💀', color: '#8b5cf6' },
  };

  const info = difficultyInfo[difficulty];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => (scale.value = withSpring(0.95))}
      onPressOut={() => (scale.value = withSpring(1))}
      onPress={onSelect}
      style={[
        styles.difficultyCard,
        animatedStyle,
        {
          backgroundColor: selected ? `${info.color}20` : theme.colors.surface,
          borderColor: selected ? info.color : theme.colors.border,
          borderRadius: theme.borderRadius.medium,
        },
      ]}
    >
      <Text style={styles.difficultyIcon}>{info.icon}</Text>
      <Text
        style={[
          styles.difficultyLabel,
          { color: selected ? info.color : theme.colors.text },
        ]}
      >
        {info.label}
      </Text>
    </AnimatedPressable>
  );
}

// Symbol Card Component
interface SymbolCardProps {
  symbol: Player;
  displaySymbol: string;
  selected: boolean;
  onSelect: () => void;
  theme: any;
  color: string;
}

function SymbolCard({ displaySymbol, selected, onSelect, theme, color }: SymbolCardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPressIn={() => (scale.value = withSpring(0.95))}
      onPressOut={() => (scale.value = withSpring(1))}
      onPress={onSelect}
      style={[
        styles.symbolCard,
        animatedStyle,
        {
          backgroundColor: selected ? `${color}20` : theme.colors.surface,
          borderColor: selected ? color : theme.colors.border,
          borderRadius: theme.borderRadius.large,
        },
      ]}
    >
      <Text
        style={[
          styles.symbolText,
          {
            color: selected ? color : theme.colors.textSecondary,
            textShadowColor: selected ? color : 'transparent',
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: selected ? 15 : 0,
          },
        ]}
      >
        {displaySymbol}
      </Text>
    </AnimatedPressable>
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
  setupContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  difficultyCard: {
    width: '45%',
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
  },
  difficultyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  difficultyLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  symbolSelection: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
  },
  symbolCard: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  symbolText: {
    fontSize: 48,
    fontWeight: '700',
  },
  symbolHint: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
  startButtonContainer: {
    paddingHorizontal: 24,
    marginTop: 16,
  },
  gameContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    alignItems: 'center',
  },
  gameControls: {
    marginTop: 32,
    flexDirection: 'row',
    gap: 16,
  },
});
