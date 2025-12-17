import {
  Board,
  Move,
  PieceColor,
  Difficulty,
  getAllValidMoves,
  applyMove,
  checkGameEnd,
  getOpponentColor,
  countPieces,
} from '@licheckers/shared';
import { AI_DEPTHS, PIECE_VALUES, POSITION_BONUS, BOARD_SIZE } from '@licheckers/shared';

// Evaluate board position from perspective of given color
function evaluateBoard(board: Board, color: PieceColor): number {
  const pieces = countPieces(board);
  const opponent = getOpponentColor(color);
  
  // Material score
  let score = 0;
  score += pieces[color].men * PIECE_VALUES.man;
  score += pieces[color].kings * PIECE_VALUES.king;
  score -= pieces[opponent].men * PIECE_VALUES.man;
  score -= pieces[opponent].kings * PIECE_VALUES.king;
  
  // Position bonuses
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];
      if (!piece) continue;
      
      const multiplier = piece.color === color ? 1 : -1;
      
      // Center control bonus
      const centerDistance = Math.abs(row - 3.5) + Math.abs(col - 3.5);
      if (centerDistance < 3) {
        score += multiplier * POSITION_BONUS.center;
      }
      
      // Advancement bonus (for men)
      if (piece.type === 'man') {
        const advancement = piece.color === 'red' 
          ? (BOARD_SIZE - 1 - row) 
          : row;
        score += multiplier * advancement * POSITION_BONUS.advancement;
      }
      
      // Back row protection bonus
      if (piece.type === 'man') {
        if ((piece.color === 'red' && row === BOARD_SIZE - 1) ||
            (piece.color === 'black' && row === 0)) {
          score += multiplier * POSITION_BONUS.backRow;
        }
      }
    }
  }
  
  return score;
}

// Minimax with alpha-beta pruning
function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
  color: PieceColor,
  originalColor: PieceColor
): number {
  const currentColor = maximizingPlayer ? originalColor : getOpponentColor(originalColor);
  const status = checkGameEnd(board, currentColor);
  
  // Terminal node or depth 0
  if (depth === 0 || status !== 'playing') {
    if (status === 'red_wins') {
      return originalColor === 'red' ? 100000 : -100000;
    }
    if (status === 'black_wins') {
      return originalColor === 'black' ? 100000 : -100000;
    }
    return evaluateBoard(board, originalColor);
  }
  
  const moves = getAllValidMoves(board, currentColor);
  
  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of moves) {
      const newBoard = applyMove(board, move);
      const evaluation = minimax(newBoard, depth - 1, alpha, beta, false, color, originalColor);
      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);
      if (beta <= alpha) break; // Beta cutoff
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of moves) {
      const newBoard = applyMove(board, move);
      const evaluation = minimax(newBoard, depth - 1, alpha, beta, true, color, originalColor);
      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);
      if (beta <= alpha) break; // Alpha cutoff
    }
    return minEval;
  }
}

// Get best move for AI
export function getBestMove(
  board: Board,
  color: PieceColor,
  difficulty: Difficulty
): Move | null {
  const moves = getAllValidMoves(board, color);
  
  if (moves.length === 0) return null;
  if (moves.length === 1) return moves[0];
  
  const depth = AI_DEPTHS[difficulty];
  
  // For easy difficulty, add randomness
  if (difficulty === 'easy') {
    // Evaluate all moves but pick randomly among top moves
    const evaluatedMoves = moves.map(move => {
      const newBoard = applyMove(board, move);
      const score = minimax(newBoard, depth - 1, -Infinity, Infinity, false, color, color);
      return { move, score };
    });
    
    evaluatedMoves.sort((a, b) => b.score - a.score);
    
    // Pick randomly from top 3 (or all if less)
    const topMoves = evaluatedMoves.slice(0, Math.min(3, evaluatedMoves.length));
    return topMoves[Math.floor(Math.random() * topMoves.length)].move;
  }
  
  // For other difficulties, pick best move
  let bestMove: Move | null = null;
  let bestScore = -Infinity;
  
  for (const move of moves) {
    const newBoard = applyMove(board, move);
    const score = minimax(newBoard, depth - 1, -Infinity, Infinity, false, color, color);
    
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  
  return bestMove;
}

