export interface Theme {
  id: string;
  name: string;
  description: string;
  isPremium: boolean;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    backgroundGradient: [string, string];
    surface: string;
    surfaceLight: string;
    text: string;
    textSecondary: string;
    textMuted: string;
    playerX: string;
    playerO: string;
    winHighlight: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  shadows: {
    small: string;
    medium: string;
    large: string;
    glow: string;
  };
  borderRadius: {
    small: number;
    medium: number;
    large: number;
    full: number;
  };
  animation: {
    duration: number;
    easing: string;
  };
}

export const themes: Record<string, Theme> = {
  neonNights: {
    id: 'neonNights',
    name: 'Neon Nights',
    description: 'Cyberpunk vibes with glowing neon colors',
    isPremium: false,
    colors: {
      primary: '#00f5ff',
      secondary: '#ff00ff',
      accent: '#ffff00',
      background: '#0a0a1a',
      backgroundGradient: ['#0a0a1a', '#1a0a2e'],
      surface: '#1a1a3a',
      surfaceLight: '#2a2a4a',
      text: '#ffffff',
      textSecondary: '#b0b0c0',
      textMuted: '#606080',
      playerX: '#00f5ff',
      playerO: '#ff00ff',
      winHighlight: '#ffff00',
      border: '#3a3a5a',
      success: '#00ff88',
      warning: '#ffaa00',
      error: '#ff4466',
    },
    shadows: {
      small: '0 2px 4px rgba(0, 245, 255, 0.2)',
      medium: '0 4px 12px rgba(0, 245, 255, 0.3)',
      large: '0 8px 24px rgba(0, 245, 255, 0.4)',
      glow: '0 0 20px rgba(0, 245, 255, 0.6)',
    },
    borderRadius: {
      small: 8,
      medium: 12,
      large: 20,
      full: 9999,
    },
    animation: {
      duration: 300,
      easing: 'ease-out',
    },
  },

  cleanMinimal: {
    id: 'cleanMinimal',
    name: 'Clean Minimal',
    description: 'Elegant simplicity with soft colors',
    isPremium: false,
    colors: {
      primary: '#2563eb',
      secondary: '#7c3aed',
      accent: '#f59e0b',
      background: '#fafafa',
      backgroundGradient: ['#fafafa', '#f0f0f5'],
      surface: '#ffffff',
      surfaceLight: '#f5f5f5',
      text: '#1a1a2e',
      textSecondary: '#4a4a5a',
      textMuted: '#9a9aaa',
      playerX: '#2563eb',
      playerO: '#dc2626',
      winHighlight: '#22c55e',
      border: '#e5e5e5',
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#dc2626',
    },
    shadows: {
      small: '0 1px 3px rgba(0, 0, 0, 0.08)',
      medium: '0 4px 12px rgba(0, 0, 0, 0.1)',
      large: '0 10px 30px rgba(0, 0, 0, 0.12)',
      glow: '0 0 15px rgba(37, 99, 235, 0.3)',
    },
    borderRadius: {
      small: 6,
      medium: 10,
      large: 16,
      full: 9999,
    },
    animation: {
      duration: 250,
      easing: 'ease-in-out',
    },
  },

  retroArcade: {
    id: 'retroArcade',
    name: 'Retro Arcade',
    description: '80s arcade aesthetics with pixel vibes',
    isPremium: false,
    colors: {
      primary: '#ff6b35',
      secondary: '#f7c548',
      accent: '#c32f27',
      background: '#1a1a2e',
      backgroundGradient: ['#1a1a2e', '#16213e'],
      surface: '#252550',
      surfaceLight: '#353570',
      text: '#ffffff',
      textSecondary: '#c0c0d0',
      textMuted: '#8080a0',
      playerX: '#ff6b35',
      playerO: '#f7c548',
      winHighlight: '#00ff88',
      border: '#4a4a7a',
      success: '#00ff88',
      warning: '#f7c548',
      error: '#c32f27',
    },
    shadows: {
      small: '4px 4px 0 rgba(0, 0, 0, 0.3)',
      medium: '6px 6px 0 rgba(0, 0, 0, 0.4)',
      large: '8px 8px 0 rgba(0, 0, 0, 0.5)',
      glow: '0 0 10px rgba(255, 107, 53, 0.8)',
    },
    borderRadius: {
      small: 4,
      medium: 4,
      large: 8,
      full: 9999,
    },
    animation: {
      duration: 200,
      easing: 'linear',
    },
  },

  midnightMode: {
    id: 'midnightMode',
    name: 'Midnight Mode',
    description: 'Deep dark theme for night owls',
    isPremium: false,
    colors: {
      primary: '#8b5cf6',
      secondary: '#06b6d4',
      accent: '#f472b6',
      background: '#0f0f1a',
      backgroundGradient: ['#0f0f1a', '#1a1a28'],
      surface: '#1e1e2e',
      surfaceLight: '#2a2a3e',
      text: '#e4e4e7',
      textSecondary: '#a1a1aa',
      textMuted: '#52525b',
      playerX: '#8b5cf6',
      playerO: '#06b6d4',
      winHighlight: '#22d3ee',
      border: '#3f3f46',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
    },
    shadows: {
      small: '0 2px 4px rgba(0, 0, 0, 0.4)',
      medium: '0 4px 12px rgba(0, 0, 0, 0.5)',
      large: '0 8px 24px rgba(0, 0, 0, 0.6)',
      glow: '0 0 20px rgba(139, 92, 246, 0.5)',
    },
    borderRadius: {
      small: 8,
      medium: 12,
      large: 18,
      full: 9999,
    },
    animation: {
      duration: 300,
      easing: 'ease-out',
    },
  },

  enchantedForest: {
    id: 'enchantedForest',
    name: 'Enchanted Forest',
    description: 'Magical purple and cyan fantasy theme',
    isPremium: false,
    colors: {
      primary: '#a855f7',
      secondary: '#22d3ee',
      accent: '#4ade80',
      background: '#0c1222',
      backgroundGradient: ['#0c1222', '#1a1035'],
      surface: '#182040',
      surfaceLight: '#243055',
      text: '#f0f9ff',
      textSecondary: '#94a3b8',
      textMuted: '#475569',
      playerX: '#a855f7',
      playerO: '#22d3ee',
      winHighlight: '#4ade80',
      border: '#334466',
      success: '#4ade80',
      warning: '#facc15',
      error: '#fb7185',
    },
    shadows: {
      small: '0 2px 8px rgba(168, 85, 247, 0.2)',
      medium: '0 4px 16px rgba(168, 85, 247, 0.3)',
      large: '0 8px 32px rgba(168, 85, 247, 0.4)',
      glow: '0 0 25px rgba(168, 85, 247, 0.6)',
    },
    borderRadius: {
      small: 10,
      medium: 14,
      large: 22,
      full: 9999,
    },
    animation: {
      duration: 350,
      easing: 'ease-in-out',
    },
  },

  deepOcean: {
    id: 'deepOcean',
    name: 'Deep Ocean',
    description: 'Calming oceanic blues and teals',
    isPremium: false,
    colors: {
      primary: '#0ea5e9',
      secondary: '#14b8a6',
      accent: '#38bdf8',
      background: '#0c1929',
      backgroundGradient: ['#0c1929', '#0a2540'],
      surface: '#0f2942',
      surfaceLight: '#153d5c',
      text: '#e0f2fe',
      textSecondary: '#7dd3fc',
      textMuted: '#38bdf8',
      playerX: '#0ea5e9',
      playerO: '#14b8a6',
      winHighlight: '#67e8f9',
      border: '#1e4976',
      success: '#2dd4bf',
      warning: '#fcd34d',
      error: '#fb7185',
    },
    shadows: {
      small: '0 2px 8px rgba(14, 165, 233, 0.2)',
      medium: '0 4px 16px rgba(14, 165, 233, 0.3)',
      large: '0 8px 32px rgba(14, 165, 233, 0.4)',
      glow: '0 0 20px rgba(14, 165, 233, 0.5)',
    },
    borderRadius: {
      small: 8,
      medium: 12,
      large: 20,
      full: 9999,
    },
    animation: {
      duration: 400,
      easing: 'ease-out',
    },
  },

  goldenSunset: {
    id: 'goldenSunset',
    name: 'Golden Sunset',
    description: 'Warm gradients inspired by sunset',
    isPremium: false,
    colors: {
      primary: '#f97316',
      secondary: '#ec4899',
      accent: '#eab308',
      background: '#1c1917',
      backgroundGradient: ['#1c1917', '#292524'],
      surface: '#292524',
      surfaceLight: '#3d3835',
      text: '#fef3c7',
      textSecondary: '#fcd34d',
      textMuted: '#a8a29e',
      playerX: '#f97316',
      playerO: '#ec4899',
      winHighlight: '#facc15',
      border: '#57534e',
      success: '#84cc16',
      warning: '#eab308',
      error: '#ef4444',
    },
    shadows: {
      small: '0 2px 8px rgba(249, 115, 22, 0.2)',
      medium: '0 4px 16px rgba(249, 115, 22, 0.3)',
      large: '0 8px 32px rgba(249, 115, 22, 0.4)',
      glow: '0 0 20px rgba(249, 115, 22, 0.6)',
    },
    borderRadius: {
      small: 8,
      medium: 14,
      large: 20,
      full: 9999,
    },
    animation: {
      duration: 320,
      easing: 'ease-in-out',
    },
  },
};

export interface SymbolStyle {
  id: string;
  name: string;
  x: string;
  o: string;
  isPremium: boolean;
}

// Type exports for convenience
export type ThemeKey = keyof typeof themes;
export type SymbolStyleKey = 'classic' | 'rounded' | 'sharp' | 'dots' | 'emoji' | 'minimal';

export const symbolStyles: Record<SymbolStyleKey, SymbolStyle> = {
  classic: { id: 'classic', name: 'Classic', x: '✕', o: '○', isPremium: false },
  rounded: { id: 'rounded', name: 'Rounded', x: '✖', o: '●', isPremium: false },
  sharp: { id: 'sharp', name: 'Sharp', x: '╳', o: '◆', isPremium: false },
  dots: { id: 'dots', name: 'Dots', x: '⊗', o: '⊙', isPremium: false },
  emoji: { id: 'emoji', name: 'Emoji', x: '⚔️', o: '🛡️', isPremium: false },
  minimal: { id: 'minimal', name: 'Minimal', x: '—', o: '|', isPremium: false },
};

export const defaultTheme = themes.neonNights;
export const defaultSymbolStyle = symbolStyles.classic;
