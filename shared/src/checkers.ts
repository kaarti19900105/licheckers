import { Board, Piece, PieceColor, Position, Move, GameState, Square, GameStatus } from './types';
import { BOARD_SIZE } from './constants';

// Create initial board setup
export function createInitialBoard(): Board {
  // Create empty 8x8 board
  const board: Board = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    board[row] = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      board[row][col] = null;
    }
  }
  
  // Place black pieces (top 3 rows, on dark squares)
  // In checkers, pieces go on dark squares where (row + col) is odd
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { color: 'black', type: 'man' };
      }
    }
  }
  
  // Place red pieces (bottom 3 rows, on dark squares)
  for (let row = 5; row < 8; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { color: 'red', type: 'man' };
      }
    }
  }
  
  return board;
}

// Create initial game state
export function createInitialGameState(): GameState {
  return {
    board: createInitialBoard(),
    currentTurn: 'black', // Black moves first in checkers
    status: 'playing',
    moves: [],
    selectedPiece: null,
    validMoves: [],
    capturedPieces: { red: 0, black: 0 },
    mustCapture: false,
    multiJumpInProgress: null,
  };
}

// Check if position is within board bounds
export function isValidPosition(pos: Position): boolean {
  return pos.row >= 0 && pos.row < BOARD_SIZE && pos.col >= 0 && pos.col < BOARD_SIZE;
}

// Check if a square is a dark square (playable)
export function isDarkSquare(row: number, col: number): boolean {
  return (row + col) % 2 === 1;
}

// Get piece at position
export function getPiece(board: Board, pos: Position): Square {
  if (!isValidPosition(pos)) return null;
  return board[pos.row][pos.col];
}

// Get opponent color
export function getOpponentColor(color: PieceColor): PieceColor {
  return color === 'red' ? 'black' : 'red';
}

// Get movement directions for a piece
function getDirections(piece: Piece): { row: number; col: number }[] {
  if (piece.type === 'king') {
    // Kings can move in all 4 diagonal directions
    return [
      { row: -1, col: -1 },
      { row: -1, col: 1 },
      { row: 1, col: -1 },
      { row: 1, col: 1 },
    ];
  }
  
  // Regular pieces move forward only
  if (piece.color === 'red') {
    // Red moves up (decreasing row)
    return [
      { row: -1, col: -1 },
      { row: -1, col: 1 },
    ];
  } else {
    // Black moves down (increasing row)
    return [
      { row: 1, col: -1 },
      { row: 1, col: 1 },
    ];
  }
}

// Check if a move would result in promotion
function wouldPromote(piece: Piece, toRow: number): boolean {
  if (piece.type === 'king') return false;
  if (piece.color === 'red' && toRow === 0) return true;
  if (piece.color === 'black' && toRow === BOARD_SIZE - 1) return true;
  return false;
}

// Find all capture moves from a position (including multi-jumps)
function findCaptureMoves(
  board: Board,
  pos: Position,
  piece: Piece,
  captures: Position[] = [],
  visited: Set<string> = new Set()
): Move[] {
  const moves: Move[] = [];
  const directions = piece.type === 'king' 
    ? [{ row: -1, col: -1 }, { row: -1, col: 1 }, { row: 1, col: -1 }, { row: 1, col: 1 }]
    : getDirections(piece);
  
  for (const dir of directions) {
    const jumpOver: Position = { row: pos.row + dir.row, col: pos.col + dir.col };
    const landOn: Position = { row: pos.row + dir.row * 2, col: pos.col + dir.col * 2 };
    
    if (!isValidPosition(jumpOver) || !isValidPosition(landOn)) continue;
    
    const jumpOverPiece = getPiece(board, jumpOver);
    const landOnSquare = getPiece(board, landOn);
    
    // Check if we can capture
    const jumpKey = `${jumpOver.row},${jumpOver.col}`;
    if (
      jumpOverPiece &&
      jumpOverPiece.color !== piece.color &&
      landOnSquare === null &&
      !visited.has(jumpKey)
    ) {
      const newCaptures = [...captures, jumpOver];
      const isPromotion = wouldPromote(piece, landOn.row);
      
      // Create the move
      const move: Move = {
        from: captures.length === 0 ? pos : { row: pos.row, col: pos.col },
        to: landOn,
        captures: newCaptures,
        isPromotion,
      };
      
      // If this is the first capture, set the original position
      if (captures.length === 0) {
        move.from = pos;
      }
      
      // If piece promotes, it cannot continue jumping (American checkers rule)
      if (isPromotion) {
        moves.push(move);
      } else {
        // Look for additional jumps
        const newVisited = new Set(visited);
        newVisited.add(jumpKey);
        
        // Temporarily remove the captured piece to find more jumps
        const tempBoard: Board = [];
        for (let r = 0; r < BOARD_SIZE; r++) {
          tempBoard[r] = [...board[r]];
        }
        tempBoard[jumpOver.row][jumpOver.col] = null;
        tempBoard[pos.row][pos.col] = null;
        tempBoard[landOn.row][landOn.col] = piece;
        
        const continuationMoves = findCaptureMoves(tempBoard, landOn, piece, newCaptures, newVisited);
        
        if (continuationMoves.length === 0) {
          // No more jumps, this is a complete move
          moves.push(move);
        } else {
          // Add all continuation moves
          for (const contMove of continuationMoves) {
            moves.push({
              from: pos,
              to: contMove.to,
              captures: contMove.captures,
              isPromotion: contMove.isPromotion,
            });
          }
        }
      }
    }
  }
  
  return moves;
}

// Find all simple (non-capture) moves from a position
function findSimpleMoves(board: Board, pos: Position, piece: Piece): Move[] {
  const moves: Move[] = [];
  const directions = getDirections(piece);
  
  for (const dir of directions) {
    const newPos: Position = { row: pos.row + dir.row, col: pos.col + dir.col };
    
    if (isValidPosition(newPos) && getPiece(board, newPos) === null) {
      moves.push({
        from: pos,
        to: newPos,
        isPromotion: wouldPromote(piece, newPos.row),
      });
    }
  }
  
  return moves;
}

// Get all valid moves for a piece at a position
export function getValidMovesForPiece(board: Board, pos: Position): Move[] {
  const piece = getPiece(board, pos);
  if (!piece) return [];
  
  const captureMoves = findCaptureMoves(board, pos, piece);
  
  // In checkers, if captures are available, they are mandatory
  if (captureMoves.length > 0) {
    return captureMoves;
  }
  
  return findSimpleMoves(board, pos, piece);
}

// Get all valid moves for a player
export function getAllValidMoves(board: Board, color: PieceColor): Move[] {
  const allMoves: Move[] = [];
  const allCaptures: Move[] = [];
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];
      if (piece && piece.color === color) {
        const pos = { row, col };
        const moves = getValidMovesForPiece(board, pos);
        
        for (const move of moves) {
          if (move.captures && move.captures.length > 0) {
            allCaptures.push(move);
          } else {
            allMoves.push(move);
          }
        }
      }
    }
  }
  
  // Mandatory capture rule: if any captures exist, only captures are valid
  if (allCaptures.length > 0) {
    return allCaptures;
  }
  
  return allMoves;
}

// Check if a move is valid
export function isValidMove(board: Board, color: PieceColor, move: Move): boolean {
  const piece = getPiece(board, move.from);
  if (!piece || piece.color !== color) return false;
  
  const validMoves = getAllValidMoves(board, color);
  return validMoves.some(
    m => 
      m.from.row === move.from.row &&
      m.from.col === move.from.col &&
      m.to.row === move.to.row &&
      m.to.col === move.to.col
  );
}

// Apply a move to the board
export function applyMove(board: Board, move: Move): Board {
  const newBoard: Board = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    newBoard[r] = [...board[r]];
  }
  
  const piece = newBoard[move.from.row][move.from.col]!;
  
  // Remove piece from original position
  newBoard[move.from.row][move.from.col] = null;
  
  // Remove captured pieces
  if (move.captures) {
    for (const captured of move.captures) {
      newBoard[captured.row][captured.col] = null;
    }
  }
  
  // Place piece at new position (possibly promoted)
  newBoard[move.to.row][move.to.col] = {
    color: piece.color,
    type: move.isPromotion ? 'king' : piece.type,
  };
  
  return newBoard;
}

// Check game end conditions
export function checkGameEnd(board: Board, currentTurn: PieceColor): GameStatus {
  const validMoves = getAllValidMoves(board, currentTurn);
  
  // If current player has no valid moves
  if (validMoves.length === 0) {
    // Check if they have any pieces left
    let hasPieces = false;
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const piece = board[row][col];
        if (piece && piece.color === currentTurn) {
          hasPieces = true;
          break;
        }
      }
      if (hasPieces) break;
    }
    
    // Player loses if they have no pieces or no valid moves
    return currentTurn === 'red' ? 'black_wins' : 'red_wins';
  }
  
  return 'playing';
}

// Count pieces on the board
export function countPieces(board: Board): { red: { men: number; kings: number }; black: { men: number; kings: number } } {
  const count = {
    red: { men: 0, kings: 0 },
    black: { men: 0, kings: 0 },
  };
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];
      if (piece) {
        if (piece.type === 'king') {
          count[piece.color].kings++;
        } else {
          count[piece.color].men++;
        }
      }
    }
  }
  
  return count;
}

// Make a move and update game state
export function makeMove(state: GameState, move: Move): GameState {
  const newBoard = applyMove(state.board, move);
  const captureCount = move.captures?.length || 0;
  const opponent = getOpponentColor(state.currentTurn);
  
  const newCapturedPieces = { ...state.capturedPieces };
  if (captureCount > 0) {
    newCapturedPieces[opponent] += captureCount;
  }
  
  const newStatus = checkGameEnd(newBoard, opponent);
  
  return {
    ...state,
    board: newBoard,
    currentTurn: opponent,
    status: newStatus,
    moves: [...state.moves, move],
    selectedPiece: null,
    validMoves: [],
    capturedPieces: newCapturedPieces,
    mustCapture: false,
    multiJumpInProgress: null,
  };
}

// Clone game state
export function cloneGameState(state: GameState): GameState {
  const newBoard: Board = [];
  for (let r = 0; r < BOARD_SIZE; r++) {
    newBoard[r] = [...state.board[r]];
  }
  
  return {
    ...state,
    board: newBoard,
    moves: [...state.moves],
    validMoves: [...state.validMoves],
    capturedPieces: { ...state.capturedPieces },
  };
}

// Position comparison helper
export function positionsEqual(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col;
}

// Convert position to algebraic notation (for display)
export function positionToNotation(pos: Position): string {
  const col = String.fromCharCode(97 + pos.col); // a-h
  const row = BOARD_SIZE - pos.row; // 1-8
  return `${col}${row}`;
}

// Convert move to notation string
export function moveToNotation(move: Move): string {
  const from = positionToNotation(move.from);
  const to = positionToNotation(move.to);
  const separator = move.captures && move.captures.length > 0 ? 'x' : '-';
  return `${from}${separator}${to}`;
}
