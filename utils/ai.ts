import { Board, Player, Difficulty } from '../stores/game-store';

const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const checkWinner = (board: Board): Player | 'draw' | null => {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  if (board.every(cell => cell !== null)) {
    return 'draw';
  }
  return null;
};

const getEmptyCells = (board: Board): number[] => {
  return board.reduce<number[]>((acc, cell, index) => {
    if (cell === null) acc.push(index);
    return acc;
  }, []);
};

// Minimax with alpha-beta pruning
const minimax = (
  board: Board,
  depth: number,
  isMaximizing: boolean,
  aiSymbol: Player,
  alpha: number = -Infinity,
  beta: number = Infinity
): number => {
  const winner = checkWinner(board);
  const humanSymbol = aiSymbol === 'X' ? 'O' : 'X';

  if (winner === aiSymbol) return 10 - depth;
  if (winner === humanSymbol) return depth - 10;
  if (winner === 'draw') return 0;

  const emptyCells = getEmptyCells(board);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const index of emptyCells) {
      const newBoard = [...board];
      newBoard[index] = aiSymbol;
      const evaluation = minimax(newBoard, depth + 1, false, aiSymbol, alpha, beta);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const index of emptyCells) {
      const newBoard = [...board];
      newBoard[index] = humanSymbol;
      const evaluation = minimax(newBoard, depth + 1, true, aiSymbol, alpha, beta);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break;
    }
    return minEval;
  }
};

// Find the best move using minimax (for impossible difficulty)
const findBestMove = (board: Board, aiSymbol: Player): number => {
  const emptyCells = getEmptyCells(board);
  let bestScore = -Infinity;
  let bestMove = emptyCells[0];

  for (const index of emptyCells) {
    const newBoard = [...board];
    newBoard[index] = aiSymbol;
    const score = minimax(newBoard, 0, false, aiSymbol);
    if (score > bestScore) {
      bestScore = score;
      bestMove = index;
    }
  }

  return bestMove;
};

// Check if AI can win in the next move
const findWinningMove = (board: Board, player: Player): number | null => {
  const emptyCells = getEmptyCells(board);
  
  for (const index of emptyCells) {
    const newBoard = [...board];
    newBoard[index] = player;
    if (checkWinner(newBoard) === player) {
      return index;
    }
  }
  return null;
};

// Find blocking move to prevent opponent from winning
const findBlockingMove = (board: Board, aiSymbol: Player): number | null => {
  const humanSymbol = aiSymbol === 'X' ? 'O' : 'X';
  return findWinningMove(board, humanSymbol);
};

// Strategic position values (center, corners, edges)
const POSITION_PRIORITY = [4, 0, 2, 6, 8, 1, 3, 5, 7];

// Easy AI: Random moves with occasional smart moves
const getEasyMove = (board: Board, aiSymbol: Player): number => {
  const emptyCells = getEmptyCells(board);
  
  // 20% chance to make a smart move
  if (Math.random() < 0.2) {
    const winMove = findWinningMove(board, aiSymbol);
    if (winMove !== null) return winMove;
  }
  
  // Otherwise random
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
};

// Medium AI: Blocks wins and takes wins, but not strategic
const getMediumMove = (board: Board, aiSymbol: Player): number => {
  const emptyCells = getEmptyCells(board);
  
  // Take winning move
  const winMove = findWinningMove(board, aiSymbol);
  if (winMove !== null) return winMove;
  
  // Block opponent's winning move
  const blockMove = findBlockingMove(board, aiSymbol);
  if (blockMove !== null) return blockMove;
  
  // Take center if available
  if (board[4] === null) return 4;
  
  // 60% chance to be strategic
  if (Math.random() < 0.6) {
    for (const pos of POSITION_PRIORITY) {
      if (board[pos] === null) return pos;
    }
  }
  
  // Random from remaining
  return emptyCells[Math.floor(Math.random() * emptyCells.length)];
};

// Hard AI: Very strategic with occasional mistakes
const getHardMove = (board: Board, aiSymbol: Player): number => {
  const emptyCells = getEmptyCells(board);
  
  // Take winning move
  const winMove = findWinningMove(board, aiSymbol);
  if (winMove !== null) return winMove;
  
  // Block opponent's winning move
  const blockMove = findBlockingMove(board, aiSymbol);
  if (blockMove !== null) return blockMove;
  
  // 10% chance to make a mistake
  if (Math.random() < 0.1) {
    return emptyCells[Math.floor(Math.random() * emptyCells.length)];
  }
  
  // Use minimax but limit depth for some imperfection
  return findBestMove(board, aiSymbol);
};

// Impossible AI: Perfect play using full minimax
const getImpossibleMove = (board: Board, aiSymbol: Player): number => {
  return findBestMove(board, aiSymbol);
};

// Main function to get AI move based on difficulty
export const getAIMove = (
  board: Board,
  aiSymbol: Player,
  difficulty: Difficulty
): number => {
  const emptyCells = getEmptyCells(board);
  
  if (emptyCells.length === 0) {
    throw new Error('No empty cells available');
  }
  
  switch (difficulty) {
    case 'easy':
      return getEasyMove(board, aiSymbol);
    case 'medium':
      return getMediumMove(board, aiSymbol);
    case 'hard':
      return getHardMove(board, aiSymbol);
    case 'impossible':
      return getImpossibleMove(board, aiSymbol);
    default:
      return getMediumMove(board, aiSymbol);
  }
};

// Get a hint for the human player
export const getHint = (board: Board, playerSymbol: Player): number | null => {
  const emptyCells = getEmptyCells(board);
  
  if (emptyCells.length === 0) return null;
  
  // Check for winning move
  const winMove = findWinningMove(board, playerSymbol);
  if (winMove !== null) return winMove;
  
  // Check for blocking move
  const opponentSymbol = playerSymbol === 'X' ? 'O' : 'X';
  const blockMove = findWinningMove(board, opponentSymbol);
  if (blockMove !== null) return blockMove;
  
  // Use strategic positions
  for (const pos of POSITION_PRIORITY) {
    if (board[pos] === null) return pos;
  }
  
  return emptyCells[0];
};

// Evaluate the current board state
export const evaluateBoard = (board: Board, playerSymbol: Player): {
  status: 'winning' | 'losing' | 'neutral';
  message: string;
} => {
  const opponentSymbol = playerSymbol === 'X' ? 'O' : 'X';
  
  // Check if player can win
  if (findWinningMove(board, playerSymbol) !== null) {
    return { status: 'winning', message: 'You can win!' };
  }
  
  // Check if opponent can win (danger)
  if (findWinningMove(board, opponentSymbol) !== null) {
    return { status: 'losing', message: 'Block the opponent!' };
  }
  
  // Count strategic positions
  let playerAdvantage = 0;
  const corners = [0, 2, 6, 8];
  const center = 4;
  
  if (board[center] === playerSymbol) playerAdvantage += 2;
  if (board[center] === opponentSymbol) playerAdvantage -= 2;
  
  for (const corner of corners) {
    if (board[corner] === playerSymbol) playerAdvantage += 1;
    if (board[corner] === opponentSymbol) playerAdvantage -= 1;
  }
  
  if (playerAdvantage > 0) {
    return { status: 'winning', message: 'Good position!' };
  } else if (playerAdvantage < 0) {
    return { status: 'losing', message: 'Be careful!' };
  }
  
  return { status: 'neutral', message: 'Game is even' };
};
