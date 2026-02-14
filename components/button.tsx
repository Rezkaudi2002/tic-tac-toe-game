import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useGameStore } from '../stores/game-store';
import { gameHaptics, soundManager } from '../utils/audio';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  style,
  textStyle,
  fullWidth = false,
}: ButtonProps) {
  const theme = useGameStore((state) => state.getTheme());
  const hapticEnabled = useGameStore((state) => state.settings.hapticEnabled);
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = async () => {
    if (disabled || loading) return;
    await gameHaptics.buttonPress(hapticEnabled);
    await soundManager.playTap();
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getBackgroundColor = () => {
    if (disabled) return theme.colors.surfaceLight;
    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      case 'outline':
      case 'ghost':
        return 'transparent';
      default:
        return theme.colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled) return theme.colors.textMuted;
    switch (variant) {
      case 'primary':
      case 'secondary':
        return '#ffffff';
      case 'outline':
        return theme.colors.primary;
      case 'ghost':
        return theme.colors.text;
      default:
        return '#ffffff';
    }
  };

  const getBorderColor = () => {
    if (disabled) return theme.colors.border;
    switch (variant) {
      case 'outline':
        return theme.colors.primary;
      default:
        return 'transparent';
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'small':
        return { paddingHorizontal: 16, paddingVertical: 8 };
      case 'large':
        return { paddingHorizontal: 32, paddingVertical: 18 };
      default:
        return { paddingHorizontal: 24, paddingVertical: 14 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'large':
        return 18;
      default:
        return 16;
    }
  };

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        animatedStyle,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 2 : 0,
          borderRadius: theme.borderRadius.medium,
          ...getPadding(),
        },
        fullWidth && styles.fullWidth,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              {
                color: getTextColor(),
                fontSize: getFontSize(),
                marginLeft: icon ? 8 : 0,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </AnimatedTouchable>
  );
}

interface IconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  size?: number;
  style?: ViewStyle;
  disabled?: boolean;
}

export function IconButton({
  icon,
  onPress,
  size = 48,
  style,
  disabled = false,
}: IconButtonProps) {
  const theme = useGameStore((state) => state.getTheme());
  const hapticEnabled = useGameStore((state) => state.settings.hapticEnabled);
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = async () => {
    if (disabled) return;
    await gameHaptics.tap(hapticEnabled);
    await soundManager.playTap();
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        styles.iconButton,
        animatedStyle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: theme.colors.surface,
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}
    >
      {icon}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});