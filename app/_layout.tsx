import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';
import { useGameStore } from '../stores/game-store';

export default function RootLayout() {
  const theme = useGameStore((state) => state.getTheme());
  const generateDailyChallenge = useGameStore((state) => state.generateDailyChallenge);

  useEffect(() => {
    generateDailyChallenge();
  }, []);

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
