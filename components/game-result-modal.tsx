import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Modal, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { useGameStore } from '../stores/game-store';
import { Button } from './button';
import { gameHaptics, soundManager } from '../utils/audio';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface GameResultModalProps {
  visible: boolean;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

export function GameResultModal({
  visible,
  onPlayAgain,
  onMainMenu,
}: GameResultModalProps) {
  const { winner, playerSymbol, gameMode, moveCount, gameHistory, statistics, settings } =
    useGameStore();
  const theme = useGameStore((state) => state.getTheme());
  const symbolStyle = useGameStore((state) => state.getSymbolStyle());

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const confettiY = useSharedValue(-100);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 200 });
      scale.value = withSpring(1, {
        damping: 12,
        stiffness: 200,
      });

      // Trigger haptics and sounds based on result
      const triggerFeedback = async () => {
        const isWin =
          gameMode === 'ai'
            ? winner === playerSymbol
            : winner !== 'draw' && winner !== null;
        const isLoss =
          gameMode === 'ai' && winner !== 'draw' && winner !== playerSymbol;

        if (isWin) {
          await gameHaptics.win(settings.hapticEnabled);
          await soundManager.playWin();
        } else if (isLoss) {
          await gameHaptics.lose(settings.hapticEnabled);
          await soundManager.playLose();
        } else {
          await gameHaptics.draw(settings.hapticEnabled);
          await soundManager.playDraw();
        }
      };

      triggerFeedback();

      // Confetti animation for wins
      const isWin =
        gameMode === 'ai'
          ? winner === playerSymbol
          : winner !== 'draw' && winner !== null;
      if (isWin) {
        confettiY.value = withSequence(
          withTiming(-100, { duration: 0 }),
          withTiming(0, { duration: 800 })
        );
      }
    } else {
      scale.value = 0;
      opacity.value = 0;
      confettiY.value = -100;
    }
  }, [visible, winner]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const confettiStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: confettiY.value }],
  }));

  const getResultTitle = () => {
    if (winner === 'draw') return "It's a Draw!";
    if (gameMode === 'ai') {
      return winner === playerSymbol ? '🎉 Victory!' : '😔 Defeat';
    }
    const winnerSymbol = winner === 'X' ? symbolStyle.x : symbolStyle.o;
    return `${winnerSymbol} Wins!`;
  };

  const getResultEmoji = () => {
    if (winner === 'draw') return '🤝';
    if (gameMode === 'ai') {
      return winner === playerSymbol ? '🏆' : '💪';
    }
    return '🎊';
  };

  const getResultColor = () => {
    if (winner === 'draw') return theme.colors.warning;
    if (gameMode === 'ai') {
      return winner === playerSymbol ? theme.colors.success : theme.colors.error;
    }
    return theme.colors.success;
  };

  const getResultMessage = () => {
    if (winner === 'draw') return 'Great game! Nobody wins this time.';
    if (gameMode === 'ai') {
      if (winner === playerSymbol) {
        const messages = [
          'Excellent strategy!',
          'You outsmarted the AI!',
          'Brilliant moves!',
          'Champion player!',
        ];
        return messages[Math.floor(Math.random() * messages.length)];
      }
      return 'Better luck next time!';
    }
    return 'Well played!';
  };

  const lastGame = gameHistory[0];
  const duration = lastGame?.duration ?? 0;

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <Modal visible={visible} transparent animationType="none">
      <Animated.View
        style={[
          styles.backdrop,
          backdropStyle,
          { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
        ]}
      >
        <Animated.View
          style={[
            styles.modal,
            modalStyle,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: theme.borderRadius.large,
            },
          ]}
        >
          {/* Confetti for wins */}
          {winner !== 'draw' &&
            (gameMode !== 'ai' || winner === playerSymbol) && (
              <Animated.View style={[styles.confetti, confettiStyle]}>
                <Text style={styles.confettiText}>🎊🎉✨🎊🎉✨🎊</Text>
              </Animated.View>
            )}

          {/* Result emoji */}
          <View
            style={[
              styles.emojiContainer,
              { backgroundColor: `${getResultColor()}20` },
            ]}
          >
            <Text style={styles.emoji}>{getResultEmoji()}</Text>
          </View>

          {/* Result title */}
          <Text style={[styles.title, { color: getResultColor() }]}>
            {getResultTitle()}
          </Text>

          {/* Result message */}
          <Text style={[styles.message, { color: theme.colors.textSecondary }]}>
            {getResultMessage()}
          </Text>

          {/* Stats */}
          <View
            style={[
              styles.statsContainer,
              {
                backgroundColor: theme.colors.surfaceLight,
                borderRadius: theme.borderRadius.medium,
              },
            ]}
          >
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                Moves
              </Text>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {moveCount}
              </Text>
            </View>
            <View
              style={[styles.statDivider, { backgroundColor: theme.colors.border }]}
            />
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                Time
              </Text>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {formatDuration(duration)}
              </Text>
            </View>
            <View
              style={[styles.statDivider, { backgroundColor: theme.colors.border }]}
            />
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: theme.colors.textMuted }]}>
                Streak
              </Text>
              <Text style={[styles.statValue, { color: theme.colors.text }]}>
                {statistics.currentStreak}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              title="Play Again"
              onPress={onPlayAgain}
              variant="primary"
              size="large"
              style={{ flex: 1, marginRight: 8 }}
            />
            <Button
              title="Menu"
              onPress={onMainMenu}
              variant="outline"
              size="large"
              style={{ flex: 1, marginLeft: 8 }}
            />
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modal: {
    width: SCREEN_WIDTH - 48,
    maxWidth: 400,
    padding: 24,
    alignItems: 'center',
    overflow: 'hidden',
  },
  confetti: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  confettiText: {
    fontSize: 24,
  },
  emojiContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 24,
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  statDivider: {
    width: 1,
    marginHorizontal: 8,
  },
  actions: {
    flexDirection: 'row',
    width: '100%',
  },
});