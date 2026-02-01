import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
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

import { useGameStore } from '@/stores/game-store';
import { themes, symbolStyles, ThemeKey, SymbolStyleKey } from '@/constants/themes';
import { IconButton } from '@/components/button';
import { gameHaptics } from '@/utils/audio';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function ThemesScreen() {
  const router = useRouter();
  const { settings, setTheme, setSymbolStyle, isPremium } = useGameStore();
  const currentTheme = themes[settings.themeId] || themes.neonNights;

  const themeKeys = Object.keys(themes) as ThemeKey[];
  const symbolKeys = Object.keys(symbolStyles) as SymbolStyleKey[];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      <View style={styles.header}>
        <IconButton
          icon={<Ionicons name="arrow-back" size={24} color={currentTheme.colors.text} />}
          onPress={() => router.back()}
        />
        <Text style={[styles.headerTitle, { color: currentTheme.colors.text }]}>
          Themes
        </Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Color Themes */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
            Color Themes
          </Text>
          <View style={styles.themesGrid}>
            {themeKeys.map((key, index) => (
              <ThemeCard
                key={key}
                themeKey={key}
                themeData={themes[key]}
                selected={settings.themeId === key}
                onSelect={() => {
                  if (!themes[key].isPremium || isPremium) {
                    gameHaptics.tap(settings.hapticEnabled);
                    setTheme(key);
                  }
                }}
                isPremium={themes[key].isPremium}
                isUnlocked={isPremium || !themes[key].isPremium}
                currentTheme={currentTheme}
                index={index}
              />
            ))}
          </View>
        </View>

        {/* Symbol Styles */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.text }]}>
            Symbol Styles
          </Text>
          <View style={styles.symbolsGrid}>
            {symbolKeys.map((key, index) => {
              const styleData = symbolStyles[key];
              const isLocked = styleData.isPremium && !isPremium;
              
              return (
                <SymbolCard
                  key={key}
                  styleKey={key}
                  symbols={styleData}
                  selected={settings.symbolStyleId === key}
                  onSelect={() => {
                    if (!isLocked) {
                      gameHaptics.tap(settings.hapticEnabled);
                      setSymbolStyle(key);
                    }
                  }}
                  isLocked={isLocked}
                  currentTheme={currentTheme}
                  index={index}
                />
              );
            })}
          </View>
        </View>

        {/* Premium Upsell */}
        {!isPremium && (
          <View style={styles.section}>
            <Pressable
              style={[
                styles.premiumCard,
                { 
                  backgroundColor: currentTheme.colors.surface,
                  borderRadius: currentTheme.borderRadius.large,
                  borderColor: currentTheme.colors.primary,
                },
              ]}
            >
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumIcon}>👑</Text>
              </View>
              <Text style={[styles.premiumTitle, { color: currentTheme.colors.text }]}>
                Unlock All Themes
              </Text>
              <Text style={[styles.premiumDescription, { color: currentTheme.colors.textSecondary }]}>
                Get access to all premium themes and symbol styles
              </Text>
              <View style={[styles.premiumButton, { backgroundColor: currentTheme.colors.primary }]}>
                <Text style={styles.premiumButtonText}>Upgrade to Premium</Text>
              </View>
            </Pressable>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// Theme Card Component
interface ThemeCardProps {
  themeKey: ThemeKey;
  themeData: typeof themes[ThemeKey];
  selected: boolean;
  onSelect: () => void;
  isPremium: boolean;
  isUnlocked: boolean;
  currentTheme: any;
  index: number;
}

function ThemeCard({ themeData, selected, onSelect, isPremium, isUnlocked, currentTheme, index }: ThemeCardProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(30);

  React.useEffect(() => {
    opacity.value = withDelay(index * 50, withTiming(1, { duration: 300 }));
    translateY.value = withDelay(index * 50, withSpring(0, { damping: 15 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return (
    <AnimatedPressable
      onPressIn={() => isUnlocked && (scale.value = withSpring(0.95))}
      onPressOut={() => (scale.value = withSpring(1))}
      onPress={onSelect}
      style={[
        styles.themeCard,
        animatedStyle,
        {
          borderColor: selected ? currentTheme.colors.primary : currentTheme.colors.border,
          borderRadius: currentTheme.borderRadius.medium,
          opacity: isUnlocked ? 1 : 0.6,
        },
      ]}
    >
      {/* Theme Preview */}
      <View style={[styles.themePreview, { backgroundColor: themeData.colors.background }]}>
        <View style={styles.previewGrid}>
          <View style={[styles.previewCell, { backgroundColor: themeData.colors.surface }]}>
            <Text style={[styles.previewSymbol, { color: themeData.colors.playerX }]}>✕</Text>
          </View>
          <View style={[styles.previewCell, { backgroundColor: themeData.colors.surface }]}>
            <Text style={[styles.previewSymbol, { color: themeData.colors.playerO }]}>○</Text>
          </View>
          <View style={[styles.previewCell, { backgroundColor: themeData.colors.surface }]}>
            <Text style={[styles.previewSymbol, { color: themeData.colors.playerX }]}>✕</Text>
          </View>
          <View style={[styles.previewCell, { backgroundColor: themeData.colors.surface }]}>
            <Text style={[styles.previewSymbol, { color: themeData.colors.playerO }]}>○</Text>
          </View>
        </View>
      </View>

      {/* Theme Name */}
      <View style={styles.themeInfo}>
        <Text style={[styles.themeName, { color: currentTheme.colors.text }]} numberOfLines={1}>
          {themeData.name}
        </Text>
        {isPremium && !isUnlocked && (
          <View style={styles.lockIcon}>
            <Ionicons name="lock-closed" size={12} color={currentTheme.colors.textSecondary} />
          </View>
        )}
      </View>

      {/* Selected Indicator */}
      {selected && (
        <View style={[styles.selectedBadge, { backgroundColor: currentTheme.colors.primary }]}>
          <Ionicons name="checkmark" size={12} color="#fff" />
        </View>
      )}
    </AnimatedPressable>
  );
}

// Symbol Card Component
interface SymbolCardProps {
  styleKey: SymbolStyleKey;
  symbols: typeof symbolStyles[SymbolStyleKey];
  selected: boolean;
  onSelect: () => void;
  isLocked: boolean;
  currentTheme: any;
  index: number;
}

function SymbolCard({ symbols, selected, onSelect, isLocked, currentTheme, index }: SymbolCardProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    opacity.value = withDelay(index * 50 + 200, withTiming(1, { duration: 300 }));
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <AnimatedPressable
      onPressIn={() => !isLocked && (scale.value = withSpring(0.95))}
      onPressOut={() => (scale.value = withSpring(1))}
      onPress={onSelect}
      style={[
        styles.symbolCard,
        animatedStyle,
        {
          backgroundColor: selected ? `${currentTheme.colors.primary}20` : currentTheme.colors.surface,
          borderColor: selected ? currentTheme.colors.primary : currentTheme.colors.border,
          borderRadius: currentTheme.borderRadius.medium,
          opacity: isLocked ? 0.5 : 1,
        },
      ]}
    >
      <View style={styles.symbolPreview}>
        <Text style={[styles.symbolX, { color: currentTheme.colors.playerX }]}>{symbols.x}</Text>
        <Text style={[styles.symbolDivider, { color: currentTheme.colors.textSecondary }]}>/</Text>
        <Text style={[styles.symbolO, { color: currentTheme.colors.playerO }]}>{symbols.o}</Text>
      </View>
      <Text style={[styles.symbolName, { color: currentTheme.colors.text }]}>{symbols.name}</Text>
      
      {isLocked && (
        <View style={styles.symbolLock}>
          <Ionicons name="lock-closed" size={14} color={currentTheme.colors.textSecondary} />
        </View>
      )}
      
      {selected && !isLocked && (
        <View style={[styles.symbolSelected, { backgroundColor: currentTheme.colors.primary }]}>
          <Ionicons name="checkmark" size={10} color="#fff" />
        </View>
      )}
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
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeCard: {
    width: '31%',
    borderWidth: 2,
    overflow: 'hidden',
  },
  themePreview: {
    aspectRatio: 1,
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewGrid: {
    width: '80%',
    aspectRatio: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  previewCell: {
    width: '46%',
    aspectRatio: 1,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewSymbol: {
    fontSize: 14,
    fontWeight: '700',
  },
  themeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    gap: 4,
  },
  themeName: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  lockIcon: {
    opacity: 0.7,
  },
  selectedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  symbolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  symbolCard: {
    width: '31%',
    padding: 16,
    borderWidth: 2,
    alignItems: 'center',
    position: 'relative',
  },
  symbolPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  symbolX: {
    fontSize: 24,
    fontWeight: '700',
  },
  symbolDivider: {
    fontSize: 20,
    marginHorizontal: 4,
  },
  symbolO: {
    fontSize: 24,
    fontWeight: '700',
  },
  symbolName: {
    fontSize: 11,
    fontWeight: '500',
  },
  symbolLock: {
    position: 'absolute',
    top: 6,
    right: 6,
  },
  symbolSelected: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  premiumCard: {
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  premiumBadge: {
    marginBottom: 12,
  },
  premiumIcon: {
    fontSize: 48,
  },
  premiumTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  premiumDescription: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  premiumButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  premiumButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
