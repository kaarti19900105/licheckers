// Piece types
export type PieceColor = 'red' | 'black';
export type PieceType = 'man' | 'king';

export interface Piece {
  color: PieceColor;
  type: PieceType;
}

// Board position
export type Position = {
  row: number;
  col: number;
};

// A single square on the board
export type Square = Piece | null;

// 8x8 board
export type Board = Square[][];

// Move representation
export interface Move {
  from: Position;
  to: Position;
  captures?: Position[]; // positions of captured pieces (for multi-jumps)
  isPromotion?: boolean;
}

// Game state
export type GameStatus = 'waiting' | 'playing' | 'red_wins' | 'black_wins' | 'draw';

export interface GameState {
  board: Board;
  currentTurn: PieceColor;
  status: GameStatus;
  moves: Move[];
  selectedPiece: Position | null;
  validMoves: Move[];
  capturedPieces: { red: number; black: number };
  mustCapture: boolean; // If true, player must make a capture move
  multiJumpInProgress: Position | null; // Position of piece that must continue jumping
}

// Time control
export interface TimeControl {
  initialTime: number; // in milliseconds
  increment: number; // in milliseconds
}

export interface ClockState {
  redTime: number;
  blackTime: number;
  isRunning: boolean;
  activeColor: PieceColor | null;
}

// Game configuration
export type GameMode = 'local' | 'computer' | 'online';
export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface GameConfig {
  mode: GameMode;
  timeControl: TimeControl | null; // null for unlimited
  difficulty?: Difficulty; // only for computer mode
  playerColor?: PieceColor; // only for computer mode
}

// Multiplayer events
export interface GameRoom {
  id: string;
  players: {
    red: string | null;
    black: string | null;
  };
  config: GameConfig;
  state: GameState;
  clock: ClockState | null;
}

// User
export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  rating: number;
  gamesPlayed: number;
  gamesWon: number;
}

// Socket events
export interface ServerToClientEvents {
  'game:state': (state: GameState) => void;
  'game:started': (room: GameRoom) => void;
  'game:ended': (result: { winner: PieceColor | 'draw'; reason: string }) => void;
  'clock:update': (clock: ClockState) => void;
  'match:found': (roomId: string) => void;
  'error': (message: string) => void;
}

export interface ClientToServerEvents {
  'game:create': (config: GameConfig) => void;
  'game:join': (roomId: string) => void;
  'game:move': (move: Move) => void;
  'game:resign': () => void;
  'game:draw:offer': () => void;
  'game:draw:respond': (accept: boolean) => void;
  'matchmaking:join': (timeControl: TimeControl) => void;
  'matchmaking:leave': () => void;
}

