// Game Types
export type Player = 'X' | 'O';
export type CellValue = Player | null;
export type Board = CellValue[];
export type GameMode = 'ai' | 'local' | 'online';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'impossible';

// Game Constants
export const BOARD_SIZE = 9;
export const EMPTY_BOARD: Board = Array(BOARD_SIZE).fill(null);

// Winning combinations (indices)
export const WIN_LINES = [
  [0, 1, 2], // Top row
  [3, 4, 5], // Middle row
  [6, 7, 8], // Bottom row
  [0, 3, 6], // Left column
  [1, 4, 7], // Middle column
  [2, 5, 8], // Right column
  [0, 4, 8], // Diagonal top-left to bottom-right
  [2, 4, 6], // Diagonal top-right to bottom-left
];

// Check if there's a winner
export function checkWinner(board: Board): { winner: Player | 'draw' | null; winLine: number[] | null } {
  // Check for winner
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] as Player, winLine: line };
    }
  }

  // Check for draw
  if (board.every((cell) => cell !== null)) {
    return { winner: 'draw', winLine: null };
  }

  // Game still in progress
  return { winner: null, winLine: null };
}

// Get available moves (empty cells)
export function getAvailableMoves(board: Board): number[] {
  return board.reduce<number[]>((moves, cell, index) => {
    if (cell === null) moves.push(index);
    return moves;
  }, []);
}

// Point values for different achievements
export const POINTS = {
  WIN: 10,
  WIN_VS_EASY: 5,
  WIN_VS_MEDIUM: 15,
  WIN_VS_HARD: 25,
  WIN_VS_IMPOSSIBLE: 50,
  STREAK_BONUS: 5, // Per win in streak
  DAILY_CHALLENGE: 25,
  ACHIEVEMENT: 50,
};

// Difficulty settings
export const DIFFICULTY_SETTINGS = {
  easy: {
    mistakeChance: 0.8,
    thinkDelay: 500,
    description: 'Perfect for beginners',
  },
  medium: {
    mistakeChance: 0.4,
    thinkDelay: 750,
    description: 'A balanced challenge',
  },
  hard: {
    mistakeChance: 0.1,
    thinkDelay: 1000,
    description: 'For experienced players',
  },
  impossible: {
    mistakeChance: 0,
    thinkDelay: 1200,
    description: 'Unbeatable AI',
  },
};
