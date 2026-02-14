import React, { useEffect, useRef } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { Player, useGameStore } from '../stores/game-store';
import { getAIMove } from '../utils/ai';
import { gameHaptics, soundManager } from '../utils/audio';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BOARD_SIZE = Math.min(SCREEN_WIDTH - 48, 360);
const CELL_SIZE = (BOARD_SIZE - 32) / 3;

interface CellProps {
  index: number;
  value: Player;
  isWinning: boolean;
  onPress: () => void;
  disabled: boolean;
}

function Cell({ index, value, isWinning, onPress, disabled }: CellProps) {
  const theme = useGameStore((state) => state.getTheme());
  const symbolStyle = useGameStore((state) => state.getSymbolStyle());

  const scale = useSharedValue(0);
  const pulse = useSharedValue(1);
  const pressScale = useSharedValue(1);

  useEffect(() => {
    if (value) {
      scale.value = withSpring(1, {
        damping: 12,
        stiffness: 200,
        mass: 0.8,
      });
    } else {
      scale.value = 0;
    }
  }, [value]);

  useEffect(() => {
    if (isWinning) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 400 }),
          withTiming(1, { duration: 400 })
        ),
        -1,
        true
      );
    } else {
      pulse.value = 1;
    }
  }, [isWinning]);

  const handlePressIn = () => {
    if (!disabled && !value) {
      pressScale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
    }
  };

  const handlePressOut = () => {
    pressScale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const cellAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }));

  const symbolAnimatedStyle = useAnimatedStyle(() => {
    const rotation = interpolate(
      scale.value,
      [0, 1],
      [-90, 0],
      Extrapolation.CLAMP
    );
    return {
      transform: [
        { scale: scale.value * pulse.value },
        { rotate: `${rotation}deg` },
      ],
      opacity: scale.value,
    };
  });

  const getSymbol = () => {
    if (value === 'X') return symbolStyle.x;
    if (value === 'O') return symbolStyle.o;
    return '';
  };

  const getSymbolColor = () => {
    if (isWinning) return theme.colors.winHighlight;
    return value === 'X' ? theme.colors.playerX : theme.colors.playerO;
  };

  return (
    <Animated.View style={[styles.cellContainer, cellAnimatedStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || !!value}
        style={[
          styles.cell,
          {
            width: CELL_SIZE,
            height: CELL_SIZE,
            backgroundColor: isWinning
              ? `${theme.colors.winHighlight}20`
              : theme.colors.surface,
            borderRadius: theme.borderRadius.medium,
            borderWidth: isWinning ? 2 : 0,
            borderColor: isWinning ? theme.colors.winHighlight : 'transparent',
          },
        ]}
      >
        <Animated.Text
          style={[
            styles.symbol,
            symbolAnimatedStyle,
            {
              color: getSymbolColor(),
              fontSize: CELL_SIZE * 0.5,
            },
          ]}
        >
          {getSymbol()}
        </Animated.Text>
      </Pressable>
    </Animated.View>
  );
}

export function GameBoard() {
  const {
    board,
    currentPlayer,
    winner,
    winningLine,
    gamePhase,
    gameMode,
    difficulty,
    playerSymbol,
    isAiThinking,
    makeMove,
    setAiThinking,
    settings,
  } = useGameStore();

  const theme = useGameStore((state) => state.getTheme());
  const aiSymbol = playerSymbol === 'X' ? 'O' : 'X';

  // Use a ref to track if AI is already working, so we don't
  // put isAiThinking in the dependency array (which would cancel the timeout)
  const aiThinkingRef = useRef(false);

  // AI move logic
  useEffect(() => {
    if (
      gameMode === 'ai' &&
      gamePhase === 'playing' &&
      winner === null &&
      currentPlayer === aiSymbol &&
      !aiThinkingRef.current
    ) {
      aiThinkingRef.current = true;
      setAiThinking(true);

      // Add delay to make AI feel more natural
      const delay = Math.random() * 500 + 300;

      const timeout = setTimeout(async () => {
        const state = useGameStore.getState();
        // Double-check state is still valid before making AI move
        if (
          state.gamePhase === 'playing' &&
          state.winner === null &&
          state.currentPlayer === aiSymbol
        ) {
          const moveIndex = getAIMove(state.board, aiSymbol, state.difficulty);
          makeMove(moveIndex);
          // Play move sound for AI move
          await soundManager.playMove();
        }
        aiThinkingRef.current = false;
        setAiThinking(false);
        await gameHaptics.move(settings.hapticEnabled);
      }, delay);

      return () => {
        clearTimeout(timeout);
        aiThinkingRef.current = false;
        setAiThinking(false);
      };
    }
  }, [currentPlayer, gamePhase, winner, gameMode, aiSymbol]);

  // Reset ref when game resets
  useEffect(() => {
    if (gamePhase === 'playing' && winner === null && board.every(c => c === null)) {
      aiThinkingRef.current = false;
    }
  }, [board, gamePhase, winner]);

  const handleCellPress = async (index: number) => {
    if (
      gamePhase !== 'playing' ||
      winner !== null ||
      (gameMode === 'ai' && currentPlayer !== playerSymbol) ||
      isAiThinking
    ) {
      return;
    }

    const success = makeMove(index);
    if (success) {
      await gameHaptics.move(settings.hapticEnabled);
      await soundManager.playMove();
    }
  };

  const isPlayerTurn = gameMode === 'ai' ? currentPlayer === playerSymbol : true;
  const isDisabled =
    gamePhase !== 'playing' ||
    winner !== null ||
    (gameMode === 'ai' && !isPlayerTurn) ||
    isAiThinking;

  return (
    <View
      style={[
        styles.board,
        {
          backgroundColor: theme.colors.surfaceLight,
          borderRadius: theme.borderRadius.large,
          padding: 8,
          width: BOARD_SIZE,
          height: BOARD_SIZE,
        },
      ]}
    >
      <View style={styles.grid}>
        {board.map((cell, index) => (
          <Cell
            key={index}
            index={index}
            value={cell}
            isWinning={winningLine?.includes(index) ?? false}
            onPress={() => handleCellPress(index)}
            disabled={isDisabled}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  board: {
    alignSelf: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cellContainer: {
    width: CELL_SIZE,
    height: CELL_SIZE,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  symbol: {
    fontWeight: '700',
  },
});