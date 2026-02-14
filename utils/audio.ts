import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { Platform } from 'react-native';

// ─── Haptics ──────────────────────────────────────────────

export const haptics = {
  light: async () => {
    if (Platform.OS !== 'web') {
      try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch { }
    }
  },

  medium: async () => {
    if (Platform.OS !== 'web') {
      try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch { }
    }
  },

  heavy: async () => {
    if (Platform.OS !== 'web') {
      try { await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy); } catch { }
    }
  },

  success: async () => {
    if (Platform.OS !== 'web') {
      try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch { }
    }
  },

  warning: async () => {
    if (Platform.OS !== 'web') {
      try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning); } catch { }
    }
  },

  error: async () => {
    if (Platform.OS !== 'web') {
      try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch { }
    }
  },

  selection: async () => {
    if (Platform.OS !== 'web') {
      try { await Haptics.selectionAsync(); } catch { }
    }
  },
};

// ─── Game-specific haptic patterns ────────────────────────

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

// ─── Sound assets ─────────────────────────────────────────

const soundAssets = {
  move: require('../assets/sounds/move.wav'),
  tap: require('../assets/sounds/tap.wav'),
  win: require('../assets/sounds/win.wav'),
  lose: require('../assets/sounds/lose.wav'),
  draw: require('../assets/sounds/draw.wav'),
};

const musicAsset = require('../assets/sounds/bgmusic.wav');

type SoundName = keyof typeof soundAssets;

// ─── Sound Manager ────────────────────────────────────────

export class SoundManager {
  private static instance: SoundManager;
  private enabled: boolean = true;
  private musicEnabled: boolean = false;
  private soundCache: Map<SoundName, Audio.Sound> = new Map();
  private musicSound: Audio.Sound | null = null;
  private musicPlaying: boolean = false;

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  /** Call once at app start to configure the audio session */
  async init() {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
    } catch (e) {
      console.warn('Audio init failed:', e);
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    if (enabled) {
      this.startBackgroundMusic();
    } else {
      this.stopBackgroundMusic();
    }
  }

  // ── SFX ───────────────────────────────────────────────

  private async play(name: SoundName) {
    if (!this.enabled) return;

    try {
      let sound = this.soundCache.get(name);

      if (sound) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded) {
          await sound.setPositionAsync(0);
          await sound.playAsync();
          return;
        }
        this.soundCache.delete(name);
      }

      const { sound: newSound } = await Audio.Sound.createAsync(
        soundAssets[name],
        { shouldPlay: true, volume: 1.0 }
      );
      this.soundCache.set(name, newSound);
    } catch (e) {
      console.warn(`Failed to play sound "${name}":`, e);
    }
  }

  async playMove() { await this.play('move'); }
  async playTap() { await this.play('tap'); }
  async playWin() { await this.play('win'); }
  async playLose() { await this.play('lose'); }
  async playDraw() { await this.play('draw'); }

  // ── Background music ──────────────────────────────────

  async startBackgroundMusic() {
    if (this.musicPlaying) return;

    try {
      // Unload previous instance if any
      if (this.musicSound) {
        try { await this.musicSound.unloadAsync(); } catch { }
        this.musicSound = null;
      }

      const { sound } = await Audio.Sound.createAsync(
        musicAsset,
        {
          shouldPlay: true,
          isLooping: true,
          volume: 0.35,
        }
      );
      this.musicSound = sound;
      this.musicPlaying = true;
    } catch (e) {
      console.warn('Failed to start background music:', e);
    }
  }

  async stopBackgroundMusic() {
    if (!this.musicSound) {
      this.musicPlaying = false;
      return;
    }

    try {
      await this.musicSound.stopAsync();
      await this.musicSound.unloadAsync();
    } catch {
      // ignore
    }
    this.musicSound = null;
    this.musicPlaying = false;
  }

  // ── Preload / cleanup ─────────────────────────────────

  async preloadAll() {
    if (!this.enabled) return;
    const names = Object.keys(soundAssets) as SoundName[];
    await Promise.all(
      names.map(async (name) => {
        try {
          const { sound } = await Audio.Sound.createAsync(soundAssets[name]);
          this.soundCache.set(name, sound);
        } catch (e) {
          console.warn(`Failed to preload "${name}":`, e);
        }
      })
    );
  }

  async unloadAll() {
    await this.stopBackgroundMusic();
    for (const [, sound] of this.soundCache) {
      try { await sound.unloadAsync(); } catch { }
    }
    this.soundCache.clear();
  }
}

export const soundManager = SoundManager.getInstance();