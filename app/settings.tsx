import React from 'react';
import { View, Text, StyleSheet, Switch, ScrollView, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useGameStore } from '@/stores/game-store';
import { themes } from '@/constants/themes';
import { IconButton } from '@/components/button';
import { haptics, soundManager } from '@/utils/audio';

export default function SettingsScreen() {
  const router = useRouter();
  const {
    settings,
    toggleSound,
    toggleMusic,
    toggleHaptic,
  } = useGameStore();

  const currentTheme = themes[settings.themeId] || themes.neonNights;

  const handleToggleSound = () => {
    toggleSound();
    // Update the sound manager immediately
    const newValue = !settings.soundEnabled;
    soundManager.setEnabled(newValue);
    // Play a confirmation sound if turning ON
    if (newValue) {
      soundManager.playTap();
    }
  };

  const handleToggleMusic = () => {
    const newValue = !settings.musicEnabled;
    toggleMusic();
    // Directly tell soundManager to start/stop music right now
    soundManager.setMusicEnabled(newValue);
  };

  const handleToggleHaptic = () => {
    toggleHaptic();
    // Give immediate haptic feedback when turning ON so the user feels it works
    const newValue = !settings.hapticEnabled;
    if (newValue) {
      haptics.success();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentTheme.colors.background }]}>
      <View style={styles.header}>
        <IconButton
          icon={<Ionicons name="close" size={24} color={currentTheme.colors.text} />}
          onPress={() => router.back()}
        />
        <Text style={[styles.headerTitle, { color: currentTheme.colors.text }]}>
          Settings
        </Text>
        <View style={{ width: 48 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Audio Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.textSecondary }]}>
            Audio
          </Text>

          <SettingRow
            icon="volume-high"
            title="Sound Effects"
            description="Play sounds for moves and wins"
            theme={currentTheme}
          >
            <Switch
              value={settings.soundEnabled}
              onValueChange={handleToggleSound}
              trackColor={{
                false: currentTheme.colors.surfaceLight,
                true: currentTheme.colors.primary,
              }}
              thumbColor="#ffffff"
            />
          </SettingRow>

          <SettingRow
            icon="musical-notes"
            title="Background Music"
            description="Play ambient music during games"
            theme={currentTheme}
          >
            <Switch
              value={settings.musicEnabled}
              onValueChange={handleToggleMusic}
              trackColor={{
                false: currentTheme.colors.surfaceLight,
                true: currentTheme.colors.primary,
              }}
              thumbColor="#ffffff"
            />
          </SettingRow>
        </View>

        {/* Feedback Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.textSecondary }]}>
            Feedback
          </Text>

          <SettingRow
            icon="phone-portrait"
            title="Haptic Feedback"
            description={Platform.OS === 'web'
              ? 'Not available on web'
              : 'Vibrate on moves and events'}
            theme={currentTheme}
          >
            <Switch
              value={settings.hapticEnabled}
              onValueChange={handleToggleHaptic}
              disabled={Platform.OS === 'web'}
              trackColor={{
                false: currentTheme.colors.surfaceLight,
                true: currentTheme.colors.primary,
              }}
              thumbColor="#ffffff"
            />
          </SettingRow>
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.textSecondary }]}>
            Appearance
          </Text>

          <Pressable onPress={() => router.push('/themes')}>
            <SettingRow
              icon="color-palette"
              title="Theme"
              description={themes[settings.themeId]?.name || 'Neon Nights'}
              theme={currentTheme}
            >
              <Ionicons name="chevron-forward" size={20} color={currentTheme.colors.textSecondary} />
            </SettingRow>
          </Pressable>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: currentTheme.colors.textSecondary }]}>
            About
          </Text>

          <SettingRow
            icon="information-circle"
            title="Version"
            description="1.0.0"
            theme={currentTheme}
          />

          <SettingRow
            icon="heart"
            title="Made with"
            description="React Native & Expo"
            theme={currentTheme}
          />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: currentTheme.colors.textSecondary }]}>
            Tic Tac Toe Ultimate
          </Text>
          <Text style={[styles.footerSubtext, { color: currentTheme.colors.textSecondary }]}>
            © 2024 • Built with ❤️
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  theme: any;
  children?: React.ReactNode;
}

function SettingRow({ icon, title, description, theme, children }: SettingRowProps) {
  return (
    <View
      style={[
        styles.settingRow,
        { backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.medium },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${theme.colors.primary}20` }]}>
        <Ionicons name={icon} size={20} color={theme.colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={[styles.settingTitle, { color: theme.colors.text }]}>{title}</Text>
        <Text style={[styles.settingDescription, { color: theme.colors.textSecondary }]}>
          {description}
        </Text>
      </View>
      {children}
    </View>
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginLeft: 4,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 8,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  settingDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footerSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
});