import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

export const haptics = {
  light: async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  },

  medium: async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  },

  heavy: async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
  },

  success: async () => {
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  },

  warning: async () => {
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  },

  error: async () => {
    if (Platform.OS !== 'web') {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  },

  selection: async () => {
    if (Platform.OS !== 'web') {
      await Haptics.selectionAsync();
    }
  },
};

// Game-specific haptic patterns
export const gameHaptics = {
  move: async (enabled: boolean) => {
    if (enabled) await haptics.light();
  },

  win: async (enabled: boolean) => {
    if (!enabled) return;
    await haptics.success();
    setTimeout(() => haptics.medium(), 100);
    setTimeout(() => haptics.heavy(), 200);
  },

  lose: async (enabled: boolean) => {
    if (enabled) await haptics.error();
  },

  draw: async (enabled: boolean) => {
    if (enabled) await haptics.warning();
  },

  tap: async (enabled: boolean) => {
    if (enabled) await haptics.selection();
  },

  buttonPress: async (enabled: boolean) => {
    if (enabled) await haptics.light();
  },
};

// Sound manager (placeholder - can be expanded with expo-av)
export class SoundManager {
  private static instance: SoundManager;
  private enabled: boolean = true;
  private musicEnabled: boolean = false;

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
  }

  async playMove() {
    if (!this.enabled) return;
    // Implement with expo-av
  }

  async playWin() {
    if (!this.enabled) return;
    // Implement with expo-av
  }

  async playLose() {
    if (!this.enabled) return;
    // Implement with expo-av
  }

  async playDraw() {
    if (!this.enabled) return;
    // Implement with expo-av
  }

  async playTap() {
    if (!this.enabled) return;
    // Implement with expo-av
  }

  async startBackgroundMusic() {
    if (!this.musicEnabled) return;
    // Implement with expo-av
  }

  async stopBackgroundMusic() {
    // Implement with expo-av
  }
}

export const soundManager = SoundManager.getInstance();
