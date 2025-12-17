import { create } from 'zustand';
import {
  GameState,
  GameConfig,
  Move,
  Position,
  PieceColor,
  TimeControl,
  ClockState,
  Board,
  createInitialGameState,
  createInitialBoard,
  getAllValidMoves,
  makeMove,
  positionsEqual,
  getPiece,
  applyMove,
} from '@licheckers/shared';

interface GameStore {
  // Game state
  gameState: GameState;
  config: GameConfig | null;
  
  // Clock state
  clock: ClockState | null;
  
  // UI state
  isFlipped: boolean;
  
  // Move navigation
  viewingMoveIndex: number | null; // null means viewing live position
  
  // Actions
  initGame: (config: GameConfig) => void;
  selectPiece: (pos: Position) => void;
  movePiece: (to: Position) => void;
  executeMove: (move: Move) => void;
  flipBoard: () => void;
  resetGame: () => void;
  
  // Clock actions
  startClock: () => void;
  stopClock: () => void;
  tickClock: () => void;
  
  // Computer move
  requestComputerMove: () => void;
  
  // Move navigation
  goToMove: (index: number | null) => void;
  goToStart: () => void;
  goToEnd: () => void;
  goBack: () => void;
  goForward: () => void;
  
  // Computed
  getDisplayBoard: () => Board;
  isViewingHistory: () => boolean;
}

// Helper to compute board state at a specific move
function getBoardAtMove(moves: Move[], targetIndex: number): Board {
  let board = createInitialBoard();
  for (let i = 0; i <= targetIndex && i < moves.length; i++) {
    board = applyMove(board, moves[i]);
  }
  return board;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: createInitialGameState(),
  config: null,
  clock: null,
  isFlipped: false,
  viewingMoveIndex: null,
  
  initGame: (config: GameConfig) => {
    const gameState = createInitialGameState();
    
    // Set up clock if time control is specified
    let clock: ClockState | null = null;
    if (config.timeControl) {
      clock = {
        redTime: config.timeControl.initialTime,
        blackTime: config.timeControl.initialTime,
        isRunning: false,
        activeColor: null,
      };
    }
    
    // Flip board so player's pieces are at the bottom
    // Black starts at array rows 0-2 (top), Red at rows 5-7 (bottom)
    // So flip when playing as Black to put black pieces at visual bottom
    const isFlipped = config.mode === 'computer' && config.playerColor === 'black';
    
    set({ gameState, config, clock, isFlipped, viewingMoveIndex: null });
  },
  
  selectPiece: (pos: Position) => {
    const { gameState, config, viewingMoveIndex } = get();
    
    // Can't select if viewing history
    if (viewingMoveIndex !== null) return;
    
    // Can't select if game is over
    if (gameState.status !== 'playing') return;
    
    // In computer mode, can only select own pieces
    if (config?.mode === 'computer' && config.playerColor !== gameState.currentTurn) {
      return;
    }
    
    const piece = getPiece(gameState.board, pos);
    
    // If no piece or wrong color, deselect
    if (!piece || piece.color !== gameState.currentTurn) {
      set({
        gameState: {
          ...gameState,
          selectedPiece: null,
          validMoves: [],
        },
      });
      return;
    }
    
    // Get valid moves for this piece
    const allValidMoves = getAllValidMoves(gameState.board, gameState.currentTurn);
    const pieceMoves = allValidMoves.filter(
      m => positionsEqual(m.from, pos)
    );
    
    // Check if this piece has moves (considering mandatory capture rule)
    const hasCaptureMoves = allValidMoves.some(m => m.captures && m.captures.length > 0);
    const thisPieceHasCaptures = pieceMoves.some(m => m.captures && m.captures.length > 0);
    
    // If there are capture moves available but this piece doesn't have any, can't select it
    if (hasCaptureMoves && !thisPieceHasCaptures) {
      return;
    }
    
    set({
      gameState: {
        ...gameState,
        selectedPiece: pos,
        validMoves: pieceMoves,
        mustCapture: hasCaptureMoves,
      },
    });
  },
  
  movePiece: (to: Position) => {
    const { gameState, viewingMoveIndex, executeMove } = get();
    
    // Can't move if viewing history
    if (viewingMoveIndex !== null) return;
    
    if (!gameState.selectedPiece) return;
    
    // Find the move that matches this destination
    const move = gameState.validMoves.find(m => positionsEqual(m.to, to));
    
    if (move) {
      executeMove(move);
    }
  },
  
  executeMove: (move: Move) => {
    const { gameState, config, clock, startClock, requestComputerMove } = get();
    
    const newState = makeMove(gameState, move);
    
    // Update clock if time control
    let newClock = clock;
    if (clock && config?.timeControl) {
      newClock = {
        ...clock,
        // Add increment to the player who just moved
        [gameState.currentTurn === 'red' ? 'redTime' : 'blackTime']:
          clock[gameState.currentTurn === 'red' ? 'redTime' : 'blackTime'] + config.timeControl.increment,
        activeColor: newState.currentTurn,
      };
    }
    
    set({ gameState: newState, clock: newClock, viewingMoveIndex: null });
    
    // Start clock if not running
    if (newClock && !newClock.isRunning) {
      startClock();
    }
    
    // If playing against computer and it's computer's turn
    if (
      config?.mode === 'computer' &&
      newState.status === 'playing' &&
      newState.currentTurn !== config.playerColor
    ) {
      // Delay computer move slightly for better UX
      setTimeout(() => {
        requestComputerMove();
      }, 500);
    }
  },
  
  flipBoard: () => {
    set((state) => ({ isFlipped: !state.isFlipped }));
  },
  
  resetGame: () => {
    const { config } = get();
    if (config) {
      get().initGame(config);
    }
  },
  
  startClock: () => {
    const { clock, gameState } = get();
    if (!clock) return;
    
    set({
      clock: {
        ...clock,
        isRunning: true,
        activeColor: gameState.currentTurn,
      },
    });
  },
  
  stopClock: () => {
    const { clock } = get();
    if (!clock) return;
    
    set({
      clock: {
        ...clock,
        isRunning: false,
        activeColor: null,
      },
    });
  },
  
  tickClock: () => {
    const { clock, gameState } = get();
    if (!clock || !clock.isRunning || !clock.activeColor) return;
    
    const timeKey = clock.activeColor === 'red' ? 'redTime' : 'blackTime';
    const newTime = Math.max(0, clock[timeKey] - 100); // Tick every 100ms
    
    const newClock = {
      ...clock,
      [timeKey]: newTime,
    };
    
    // Check for timeout
    if (newTime === 0) {
      const winner = clock.activeColor === 'red' ? 'black_wins' : 'red_wins';
      set({
        clock: { ...newClock, isRunning: false },
        gameState: { ...gameState, status: winner },
      });
      return;
    }
    
    set({ clock: newClock });
  },
  
  requestComputerMove: () => {
    const { gameState, config, executeMove } = get();
    
    if (gameState.status !== 'playing') return;
    if (config?.mode !== 'computer') return;
    
    // Import AI and get move
    import('../lib/ai').then(({ getBestMove }) => {
      const move = getBestMove(gameState.board, gameState.currentTurn, config.difficulty || 'medium');
      if (move) {
        executeMove(move);
      }
    });
  },
  
  // Move navigation
  goToMove: (index: number | null) => {
    set({ viewingMoveIndex: index });
  },
  
  goToStart: () => {
    const { gameState } = get();
    if (gameState.moves.length > 0) {
      set({ viewingMoveIndex: -1 }); // -1 means before any moves (initial position)
    }
  },
  
  goToEnd: () => {
    set({ viewingMoveIndex: null });
  },
  
  goBack: () => {
    const { gameState, viewingMoveIndex } = get();
    if (gameState.moves.length === 0) return;
    
    if (viewingMoveIndex === null) {
      // Currently at live position, go to last move
      set({ viewingMoveIndex: gameState.moves.length - 2 });
    } else if (viewingMoveIndex > -1) {
      set({ viewingMoveIndex: viewingMoveIndex - 1 });
    }
  },
  
  goForward: () => {
    const { gameState, viewingMoveIndex } = get();
    if (viewingMoveIndex === null) return; // Already at live position
    
    if (viewingMoveIndex < gameState.moves.length - 1) {
      set({ viewingMoveIndex: viewingMoveIndex + 1 });
    } else {
      // At the last move, go to live position
      set({ viewingMoveIndex: null });
    }
  },
  
  getDisplayBoard: () => {
    const { gameState, viewingMoveIndex } = get();
    
    if (viewingMoveIndex === null) {
      return gameState.board;
    }
    
    if (viewingMoveIndex === -1) {
      return createInitialBoard();
    }
    
    return getBoardAtMove(gameState.moves, viewingMoveIndex);
  },
  
  isViewingHistory: () => {
    return get().viewingMoveIndex !== null;
  },
}));
