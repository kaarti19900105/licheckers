import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCw } from 'lucide-react';
import { GameConfig, Difficulty, PieceColor, Position } from '@licheckers/shared';
import { TIME_CONTROLS } from '@licheckers/shared';
import { useGameStore } from '../store/gameStore';
import Board from '../components/Board';
import GameInfo from '../components/GameInfo';

export default function Game() {
  const { mode } = useParams<{ mode: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showResignConfirm, setShowResignConfirm] = useState(false);

  const {
    gameState,
    config,
    clock,
    isFlipped,
    viewingMoveIndex,
    initGame,
    selectPiece,
    movePiece,
    flipBoard,
    resetGame,
    requestComputerMove,
    getDisplayBoard,
    goToEnd,
  } = useGameStore();

  // Initialize game on mount
  useEffect(() => {
    const timeControlId = searchParams.get('time');
    const difficulty = (searchParams.get('difficulty') as Difficulty) || 'medium';
    const playerColor = (searchParams.get('color') as PieceColor) || 'black';

    const gameConfig: GameConfig = {
      mode: mode as 'local' | 'computer' | 'online',
      timeControl: timeControlId ? TIME_CONTROLS[timeControlId] : null,
      difficulty: mode === 'computer' ? difficulty : undefined,
      playerColor: mode === 'computer' ? playerColor : undefined,
    };

    initGame(gameConfig);
  }, [mode, searchParams, initGame]);

  // Trigger computer's first move if computer plays black
  useEffect(() => {
    if (
      config?.mode === 'computer' &&
      config.playerColor === 'red' &&
      gameState.currentTurn === 'black' &&
      gameState.moves.length === 0 &&
      gameState.status === 'playing'
    ) {
      setTimeout(() => {
        requestComputerMove();
      }, 500);
    }
  }, [config, gameState.currentTurn, gameState.moves.length, gameState.status, requestComputerMove]);

  const handleSquareClick = (pos: { row: number; col: number }) => {
    // If viewing history, go to current position first
    if (viewingMoveIndex !== null) {
      goToEnd();
      return;
    }
    
    const piece = gameState.board[pos.row][pos.col];
    
    if (piece && piece.color === gameState.currentTurn) {
      selectPiece(pos);
    } else if (gameState.selectedPiece) {
      movePiece(pos);
    }
  };

  const handleDragStart = (pos: Position) => {
    // If viewing history, go to current position first
    if (viewingMoveIndex !== null) {
      goToEnd();
      return;
    }
    
    const piece = gameState.board[pos.row][pos.col];
    if (piece && piece.color === gameState.currentTurn) {
      selectPiece(pos);
    }
  };

  const handleDrop = (_from: Position, to: Position) => {
    // If viewing history, ignore
    if (viewingMoveIndex !== null) return;
    
    // The piece should already be selected from dragStart
    // Just move to the target
    movePiece(to);
  };

  const handleResign = () => {
    if (showResignConfirm) {
      useGameStore.setState((state) => ({
        gameState: {
          ...state.gameState,
          status: state.gameState.currentTurn === 'red' ? 'black_wins' : 'red_wins',
        },
      }));
      setShowResignConfirm(false);
    } else {
      setShowResignConfirm(true);
    }
  };

  const handleRematch = () => {
    resetGame();
  };

  const handleHome = () => {
    navigate('/');
  };

  // Get the last move for highlighting (based on viewing position)
  const getLastMove = () => {
    if (gameState.moves.length === 0) return null;
    
    if (viewingMoveIndex === null) {
      return gameState.moves[gameState.moves.length - 1];
    }
    
    if (viewingMoveIndex === -1) {
      return null; // Viewing initial position
    }
    
    return gameState.moves[viewingMoveIndex];
  };

  const displayBoard = getDisplayBoard();
  const lastMove = getLastMove();
  
  // When viewing history, don't show valid moves
  const validMoves = viewingMoveIndex !== null ? [] : gameState.validMoves;
  const selectedPiece = viewingMoveIndex !== null ? null : gameState.selectedPiece;

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent-green border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-3 px-4 border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
            onClick={handleHome}
          >
            <ArrowLeft size={18} />
            <span className="font-bold text-text-primary">
              licheckers<span className="text-accent-green">.org</span>
            </span>
          </button>
          <button
            className="p-2 rounded hover:bg-bg-hover transition-colors text-text-secondary"
            onClick={flipBoard}
            title="Flip board"
          >
            <RotateCw size={18} />
          </button>
        </div>
      </header>

      {/* Game area */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-4">
          {/* Board */}
          <Board
            board={displayBoard}
            selectedPiece={selectedPiece}
            validMoves={validMoves}
            lastMove={lastMove}
            isFlipped={isFlipped}
            onSquareClick={handleSquareClick}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
          />

          {/* Game info panel */}
          <GameInfo
            gameState={gameState}
            config={config}
            clock={clock}
            isFlipped={isFlipped}
            onResign={handleResign}
            onRematch={handleRematch}
            onHome={handleHome}
          />
        </div>
      </main>

      {/* Resign confirmation modal */}
      {showResignConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="card p-4 max-w-xs mx-4">
            <h3 className="font-medium text-text-primary mb-3">Resign?</h3>
            <p className="text-text-secondary text-sm mb-4">
              This will count as a loss.
            </p>
            <div className="flex gap-2">
              <button
                className="btn btn-secondary flex-1 text-sm"
                onClick={() => setShowResignConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger flex-1 text-sm"
                onClick={handleResign}
              >
                Resign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
