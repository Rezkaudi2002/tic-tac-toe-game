import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { useGameStore } from '../stores/game-store';

export function GameStatus() {
  const {
    currentPlayer,
    winner,
    gamePhase,
    gameMode,
    playerSymbol,
    isAiThinking,
    moveCount,
  } = useGameStore();

  const theme = useGameStore((state) => state.getTheme());
  const symbolStyle = useGameStore((state) => state.getSymbolStyle());

  const dotScale1 = useSharedValue(1);
  const dotScale2 = useSharedValue(1);
  const dotScale3 = useSharedValue(1);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (isAiThinking) {
      dotScale1.value = withRepeat(
        withSequence(
          withTiming(1.5, { duration: 300 }),
          withTiming(1, { duration: 300 })
        ),
        -1
      );
      dotScale2.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 150 }),
          withTiming(1.5, { duration: 300 }),
          withTiming(1, { duration: 300 })
        ),
        -1
      );
      dotScale3.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 300 }),
          withTiming(1.5, { duration: 300 }),
          withTiming(1, { duration: 300 })
        ),
        -1
      );
    } else {
      dotScale1.value = 1;
      dotScale2.value = 1;
      dotScale3.value = 1;
    }
  }, [isAiThinking]);

  useEffect(() => {
    if (gamePhase === 'playing' && !winner) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1
      );
    } else {
      pulseScale.value = withSpring(1);
    }
  }, [gamePhase, winner]);

  const dot1Style = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale1.value }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale2.value }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale3.value }],
  }));

  const statusContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const getStatusText = () => {
    if (winner === 'draw') {
      return "It's a Draw!";
    }
    
    if (winner) {
      const winnerSymbol = winner === 'X' ? symbolStyle.x : symbolStyle.o;
      if (gameMode === 'ai') {
        return winner === playerSymbol ? '🎉 You Win!' : '😔 AI Wins';
      }
      return `${winnerSymbol} Wins!`;
    }

    if (isAiThinking) {
      return 'AI is thinking';
    }

    const currentSymbol = currentPlayer === 'X' ? symbolStyle.x : symbolStyle.o;
    if (gameMode === 'ai') {
      return currentPlayer === playerSymbol ? 'Your Turn' : 'AI Turn';
    }
    return `${currentSymbol}'s Turn`;
  };

  const getStatusColor = () => {
    if (winner === 'draw') return theme.colors.warning;
    if (winner) {
      if (gameMode === 'ai') {
        return winner === playerSymbol ? theme.colors.success : theme.colors.error;
      }
      return winner === 'X' ? theme.colors.playerX : theme.colors.playerO;
    }
    return currentPlayer === 'X' ? theme.colors.playerX : theme.colors.playerO;
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.statusContainer,
          statusContainerStyle,
          {
            backgroundColor: `${getStatusColor()}20`,
            borderRadius: theme.borderRadius.large,
            borderColor: `${getStatusColor()}40`,
            borderWidth: 1,
          },
        ]}
      >
        <Text
          style={[
            styles.statusText,
            {
              color: getStatusColor(),
            },
          ]}
        >
          {getStatusText()}
        </Text>
        
        {isAiThinking && (
          <View style={styles.dotsContainer}>
            <Animated.View
              style={[
                styles.dot,
                dot1Style,
                { backgroundColor: getStatusColor() },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                dot2Style,
                { backgroundColor: getStatusColor() },
              ]}
            />
            <Animated.View
              style={[
                styles.dot,
                dot3Style,
                { backgroundColor: getStatusColor() },
              ]}
            />
          </View>
        )}
      </Animated.View>

      <View style={styles.moveCounter}>
        <Text style={[styles.moveText, { color: theme.colors.textSecondary }]}>
          Move {moveCount}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  statusText: {
    fontSize: 20,
    fontWeight: '700',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginLeft: 8,
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  moveCounter: {
    marginTop: 8,
  },
  moveText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
