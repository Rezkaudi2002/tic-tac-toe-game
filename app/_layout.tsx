import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../stores/game-store';
import { soundManager } from '../utils/audio';

export default function RootLayout() {
  const theme = useGameStore((state) => state.getTheme());
  const generateDailyChallenge = useGameStore((state) => state.generateDailyChallenge);
  const soundEnabled = useGameStore((state) => state.settings.soundEnabled);
  const musicEnabled = useGameStore((state) => state.settings.musicEnabled);

  useEffect(() => {
    generateDailyChallenge();

    // Initialize audio system and preload sounds
    soundManager.init().then(() => {
      soundManager.setEnabled(soundEnabled);
      soundManager.preloadAll();
      // Start music if it was enabled from a previous session
      if (musicEnabled) {
        soundManager.startBackgroundMusic();
      }
    });

    return () => {
      soundManager.unloadAll();
    };
  }, []);

  // Sync sound-enabled flag whenever the setting changes
  useEffect(() => {
    soundManager.setEnabled(soundEnabled);
  }, [soundEnabled]);

  // Sync music on/off whenever the setting changes
  useEffect(() => {
    soundManager.setMusicEnabled(musicEnabled);
  }, [musicEnabled]);

  return (
    <GestureHandlerRootView style={styles.container}>
      <LinearGradient
        colors={theme.colors.backgroundGradient}
        style={StyleSheet.absoluteFill}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent' },
          animation: 'fade',
        }}
      />
      <StatusBar style="light" />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});