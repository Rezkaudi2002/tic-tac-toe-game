import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { themes, symbolStyles, defaultTheme, defaultSymbolStyle } from '../constants/themes';

export type Player = 'X' | 'O' | null;
export type Board = Player[];
export type GameMode = 'ai' | 'local' | 'online';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'impossible';
export type GamePhase = 'menu' | 'setup' | 'playing' | 'finished';

export interface GameResult {
  id: string;
  date: string;
  mode: GameMode;
  difficulty?: Difficulty;
  winner: Player | 'draw';
  playerSymbol: Player;
  moves: number;
  duration: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  target: number;
}

export interface DailyChallenge {
  id: string;
  date: string;
  type: 'win_streak' | 'no_loss' | 'fast_win' | 'beat_ai';
  target: number;
  progress: number;
  completed: boolean;
  reward: number;
  difficulty?: Difficulty;
}

export interface Statistics {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  currentStreak: number;
  bestStreak: number;
  totalMoves: number;
  fastestWin: number;
  aiWins: Record<Difficulty, number>;
  lastPlayed?: string;
}

export interface Settings {
  themeId: string;
  symbolStyleId: string;
  soundEnabled: boolean;
  musicEnabled: boolean;
  hapticEnabled: boolean;
  showHints: boolean;
}

export interface GameState {
  // Current game
  board: Board;
  currentPlayer: Player;
  winner: Player | 'draw' | null;
  winningLine: number[] | null;
  gamePhase: GamePhase;
  gameMode: GameMode;
  difficulty: Difficulty;
  playerSymbol: Player;
  moveCount: number;
  gameStartTime: number | null;
  isAiThinking: boolean;

  // Persistent data
  settings: Settings;
  statistics: Statistics;
  achievements: Achievement[];
  gameHistory: GameResult[];
  dailyChallenge: DailyChallenge | null;
  points: number;
  isPremium: boolean;

  // Actions
  startGame: (mode: GameMode, difficulty?: Difficulty, playerSymbol?: Player) => void;
  makeMove: (index: number) => boolean;
  resetGame: () => void;
  setPhase: (phase: GamePhase) => void;
  setAiThinking: (thinking: boolean) => void;

  // Settings actions
  setTheme: (themeId: string) => void;
  setSymbolStyle: (styleId: string) => void;
  toggleSound: () => void;
  toggleMusic: () => void;
  toggleHaptic: () => void;
  toggleHints: () => void;

  // Premium actions
  unlockPremium: () => void;

  // Stats & achievements
  updateStatistics: (result: GameResult) => void;
  checkAchievements: () => Achievement[];
  generateDailyChallenge: () => void;
  updateDailyChallengeProgress: () => void;

  // Helpers
  getTheme: () => typeof defaultTheme;
  getSymbolStyle: () => typeof defaultSymbolStyle;
}

const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6], // Diagonals
];

const initialBoard: Board = Array(9).fill(null);

const initialStatistics: Statistics = {
  totalGames: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  currentStreak: 0,
  bestStreak: 0,
  totalMoves: 0,
  fastestWin: Infinity,
  aiWins: { easy: 0, medium: 0, hard: 0, impossible: 0 },
};

const initialSettings: Settings = {
  themeId: 'neonNights',
  symbolStyleId: 'classic',
  soundEnabled: true,
  musicEnabled: false,
  hapticEnabled: true,
  showHints: true,
};

const initialAchievements: Achievement[] = [
  { id: 'first_win', name: 'First Victory', description: 'Win your first game', icon: '🏆', unlocked: false, progress: 0, target: 1 },
  { id: 'streak_3', name: 'Hot Streak', description: 'Win 3 games in a row', icon: '🔥', unlocked: false, progress: 0, target: 3 },
  { id: 'streak_5', name: 'On Fire', description: 'Win 5 games in a row', icon: '💥', unlocked: false, progress: 0, target: 5 },
  { id: 'streak_10', name: 'Unstoppable', description: 'Win 10 games in a row', icon: '⚡', unlocked: false, progress: 0, target: 10 },
  { id: 'games_10', name: 'Getting Started', description: 'Play 10 games', icon: '🎮', unlocked: false, progress: 0, target: 10 },
  { id: 'games_50', name: 'Dedicated', description: 'Play 50 games', icon: '🎯', unlocked: false, progress: 0, target: 50 },
  { id: 'games_100', name: 'Master Player', description: 'Play 100 games', icon: '👑', unlocked: false, progress: 0, target: 100 },
  { id: 'beat_easy', name: 'Baby Steps', description: 'Beat AI on Easy', icon: '🌱', unlocked: false, progress: 0, target: 1 },
  { id: 'beat_medium', name: 'Rising Star', description: 'Beat AI on Medium', icon: '⭐', unlocked: false, progress: 0, target: 1 },
  { id: 'beat_hard', name: 'Challenger', description: 'Beat AI on Hard', icon: '💪', unlocked: false, progress: 0, target: 1 },
  { id: 'beat_impossible', name: 'Legend', description: 'Beat AI on Impossible', icon: '🏅', unlocked: false, progress: 0, target: 1 },
  { id: 'speed_demon', name: 'Speed Demon', description: 'Win in under 10 seconds', icon: '⏱️', unlocked: false, progress: 0, target: 1 },
  { id: 'daily_3', name: 'Daily Warrior', description: 'Complete 3 daily challenges', icon: '📅', unlocked: false, progress: 0, target: 3 },
  { id: 'daily_7', name: 'Weekly Champion', description: 'Complete 7 daily challenges', icon: '🗓️', unlocked: false, progress: 0, target: 7 },
  { id: 'perfectionist', name: 'Perfectionist', description: 'Win 10 games without a loss', icon: '💎', unlocked: false, progress: 0, target: 10 },
];

const checkWinner = (board: Board): { winner: Player | 'draw' | null; line: number[] | null } => {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line };
    }
  }
  if (board.every(cell => cell !== null)) {
    return { winner: 'draw', line: null };
  }
  return { winner: null, line: null };
};

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial game state
      board: initialBoard,
      currentPlayer: 'X',
      winner: null,
      winningLine: null,
      gamePhase: 'menu',
      gameMode: 'ai',
      difficulty: 'medium',
      playerSymbol: 'X',
      moveCount: 0,
      gameStartTime: null,
      isAiThinking: false,

      // Initial persistent state
      settings: initialSettings,
      statistics: initialStatistics,
      achievements: initialAchievements,
      gameHistory: [],
      dailyChallenge: null,
      points: 0,
      isPremium: false,

      startGame: (mode, difficulty = 'medium', playerSymbol = 'X') => {
        set({
          board: initialBoard,
          currentPlayer: 'X',
          winner: null,
          winningLine: null,
          gamePhase: 'playing',
          gameMode: mode,
          difficulty: mode === 'ai' ? difficulty : 'medium',
          playerSymbol: playerSymbol,
          moveCount: 0,
          gameStartTime: Date.now(),
          isAiThinking: false,
        });
      },

      makeMove: (index) => {
        const state = get();
        if (
          state.board[index] !== null ||
          state.winner !== null ||
          state.gamePhase !== 'playing'
        ) {
          return false;
        }

        const newBoard = [...state.board];
        newBoard[index] = state.currentPlayer;
        const { winner, line } = checkWinner(newBoard);
        const newMoveCount = state.moveCount + 1;

        set({
          board: newBoard,
          currentPlayer: state.currentPlayer === 'X' ? 'O' : 'X',
          winner,
          winningLine: line,
          moveCount: newMoveCount,
          gamePhase: winner !== null ? 'finished' : 'playing',
        });

        if (winner !== null) {
          const duration = state.gameStartTime 
            ? Math.floor((Date.now() - state.gameStartTime) / 1000) 
            : 0;
          
          const result: GameResult = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            mode: state.gameMode,
            difficulty: state.gameMode === 'ai' ? state.difficulty : undefined,
            winner,
            playerSymbol: state.playerSymbol,
            moves: newMoveCount,
            duration,
          };

          get().updateStatistics(result);
          get().checkAchievements();
          get().updateDailyChallengeProgress();
        }

        return true;
      },

      resetGame: () => {
        const state = get();
        set({
          board: initialBoard,
          currentPlayer: 'X',
          winner: null,
          winningLine: null,
          gamePhase: 'playing',
          moveCount: 0,
          gameStartTime: Date.now(),
          isAiThinking: false,
        });
      },

      setPhase: (phase) => set({ gamePhase: phase }),
      
      setAiThinking: (thinking) => set({ isAiThinking: thinking }),

      setTheme: (themeId) => {
        const theme = themes[themeId];
        if (theme && (!theme.isPremium || get().isPremium)) {
          set((state) => ({
            settings: { ...state.settings, themeId },
          }));
        }
      },

      setSymbolStyle: (styleId) => {
        const style = symbolStyles[styleId as keyof typeof symbolStyles];
        if (style && (!style.isPremium || get().isPremium)) {
          set((state) => ({
            settings: { ...state.settings, symbolStyleId: styleId },
          }));
        }
      },

      toggleSound: () => set((state) => ({
        settings: { ...state.settings, soundEnabled: !state.settings.soundEnabled },
      })),

      toggleMusic: () => set((state) => ({
        settings: { ...state.settings, musicEnabled: !state.settings.musicEnabled },
      })),

      toggleHaptic: () => set((state) => ({
        settings: { ...state.settings, hapticEnabled: !state.settings.hapticEnabled },
      })),

      toggleHints: () => set((state) => ({
        settings: { ...state.settings, showHints: !state.settings.showHints },
      })),

      unlockPremium: () => set({ isPremium: true }),

      updateStatistics: (result) => {
        set((state) => {
          const isWin = result.winner === result.playerSymbol;
          const isLoss = result.winner !== 'draw' && result.winner !== result.playerSymbol;
          const isDraw = result.winner === 'draw';

          const newStreak = isWin ? state.statistics.currentStreak + 1 : 0;
          const points = isWin ? 10 : isDraw ? 3 : 1;

          const newStats: Statistics = {
            totalGames: state.statistics.totalGames + 1,
            wins: state.statistics.wins + (isWin ? 1 : 0),
            losses: state.statistics.losses + (isLoss ? 1 : 0),
            draws: state.statistics.draws + (isDraw ? 1 : 0),
            currentStreak: newStreak,
            bestStreak: Math.max(state.statistics.bestStreak, newStreak),
            totalMoves: state.statistics.totalMoves + result.moves,
            fastestWin: isWin 
              ? Math.min(state.statistics.fastestWin, result.duration)
              : state.statistics.fastestWin,
            aiWins: result.mode === 'ai' && isWin && result.difficulty
              ? {
                  ...state.statistics.aiWins,
                  [result.difficulty]: state.statistics.aiWins[result.difficulty] + 1,
                }
              : state.statistics.aiWins,
            lastPlayed: result.date,
          };

          return {
            statistics: newStats,
            gameHistory: [result, ...state.gameHistory].slice(0, 100),
            points: state.points + points,
          };
        });
      },

      checkAchievements: () => {
        const state = get();
        const stats = state.statistics;
        const unlockedNow: Achievement[] = [];

        const newAchievements = state.achievements.map((achievement) => {
          if (achievement.unlocked) return achievement;

          let progress = achievement.progress;
          let shouldUnlock = false;

          switch (achievement.id) {
            case 'first_win':
              progress = Math.min(stats.wins, 1);
              shouldUnlock = stats.wins >= 1;
              break;
            case 'streak_3':
              progress = Math.min(stats.currentStreak, 3);
              shouldUnlock = stats.bestStreak >= 3;
              break;
            case 'streak_5':
              progress = Math.min(stats.currentStreak, 5);
              shouldUnlock = stats.bestStreak >= 5;
              break;
            case 'streak_10':
              progress = Math.min(stats.currentStreak, 10);
              shouldUnlock = stats.bestStreak >= 10;
              break;
            case 'games_10':
              progress = Math.min(stats.totalGames, 10);
              shouldUnlock = stats.totalGames >= 10;
              break;
            case 'games_50':
              progress = Math.min(stats.totalGames, 50);
              shouldUnlock = stats.totalGames >= 50;
              break;
            case 'games_100':
              progress = Math.min(stats.totalGames, 100);
              shouldUnlock = stats.totalGames >= 100;
              break;
            case 'beat_easy':
              progress = Math.min(stats.aiWins.easy, 1);
              shouldUnlock = stats.aiWins.easy >= 1;
              break;
            case 'beat_medium':
              progress = Math.min(stats.aiWins.medium, 1);
              shouldUnlock = stats.aiWins.medium >= 1;
              break;
            case 'beat_hard':
              progress = Math.min(stats.aiWins.hard, 1);
              shouldUnlock = stats.aiWins.hard >= 1;
              break;
            case 'beat_impossible':
              progress = Math.min(stats.aiWins.impossible, 1);
              shouldUnlock = stats.aiWins.impossible >= 1;
              break;
            case 'speed_demon':
              progress = stats.fastestWin <= 10 ? 1 : 0;
              shouldUnlock = stats.fastestWin <= 10;
              break;
            case 'perfectionist':
              progress = stats.losses === 0 ? Math.min(stats.wins, 10) : 0;
              shouldUnlock = stats.wins >= 10 && stats.losses === 0;
              break;
          }

          if (shouldUnlock && !achievement.unlocked) {
            const updated = {
              ...achievement,
              progress,
              unlocked: true,
              unlockedAt: new Date().toISOString(),
            };
            unlockedNow.push(updated);
            return updated;
          }

          return { ...achievement, progress };
        });

        set({ achievements: newAchievements });
        return unlockedNow;
      },

      generateDailyChallenge: () => {
        const today = new Date().toISOString().split('T')[0];
        const state = get();
        
        if (state.dailyChallenge?.date === today) return;

        const types: DailyChallenge['type'][] = ['win_streak', 'no_loss', 'fast_win', 'beat_ai'];
        const type = types[Math.floor(Math.random() * types.length)];
        
        let target = 3;
        let reward = 25;
        let difficulty: Difficulty | undefined;

        switch (type) {
          case 'win_streak':
            target = Math.floor(Math.random() * 3) + 2;
            reward = target * 10;
            break;
          case 'no_loss':
            target = Math.floor(Math.random() * 3) + 3;
            reward = target * 8;
            break;
          case 'fast_win':
            target = 1;
            reward = 30;
            break;
          case 'beat_ai':
            const difficulties: Difficulty[] = ['easy', 'medium', 'hard', 'impossible'];
            difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];
            target = 1;
            reward = difficulty === 'impossible' ? 50 : difficulty === 'hard' ? 35 : 25;
            break;
        }

        set({
          dailyChallenge: {
            id: today,
            date: today,
            type,
            target,
            progress: 0,
            completed: false,
            reward,
            difficulty,
          },
        });
      },

      updateDailyChallengeProgress: () => {
        const state = get();
        if (!state.dailyChallenge || state.dailyChallenge.completed) return;

        const challenge = state.dailyChallenge;
        const stats = state.statistics;
        const lastResult = state.gameHistory[0];
        
        if (!lastResult) return;

        let progress = challenge.progress;
        const isWin = lastResult.winner === lastResult.playerSymbol;

        switch (challenge.type) {
          case 'win_streak':
            progress = isWin ? progress + 1 : 0;
            break;
          case 'no_loss':
            const isLoss = lastResult.winner !== 'draw' && lastResult.winner !== lastResult.playerSymbol;
            progress = isLoss ? 0 : progress + 1;
            break;
          case 'fast_win':
            progress = isWin && lastResult.duration <= 15 ? 1 : progress;
            break;
          case 'beat_ai':
            if (lastResult.mode === 'ai' && isWin && lastResult.difficulty === challenge.difficulty) {
              progress = 1;
            }
            break;
        }

        const completed = progress >= challenge.target;

        set((state) => ({
          dailyChallenge: { ...challenge, progress, completed },
          points: completed && !challenge.completed 
            ? state.points + challenge.reward 
            : state.points,
        }));
      },

      getTheme: () => themes[get().settings.themeId] || defaultTheme,
      
      getSymbolStyle: () => 
        symbolStyles[get().settings.symbolStyleId as keyof typeof symbolStyles] || defaultSymbolStyle,
    }),
    {
      name: 'tic-tac-toe-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        settings: state.settings,
        statistics: state.statistics,
        achievements: state.achievements,
        gameHistory: state.gameHistory,
        dailyChallenge: state.dailyChallenge,
        points: state.points,
        isPremium: state.isPremium,
      }),
    }
  )
);
