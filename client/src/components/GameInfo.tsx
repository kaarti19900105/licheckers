import { memo, useEffect } from 'react';
import { RotateCcw, Flag, Home, ChevronFirst, ChevronLast, ChevronLeft, ChevronRight } from 'lucide-react';
import { GameState, GameConfig, PieceColor, ClockState, countPieces } from '@licheckers/shared';
import Clock from './Clock';
import { useGameStore } from '../store/gameStore';

interface GameInfoProps {
  gameState: GameState;
  config: GameConfig;
  clock: ClockState | null;
  isFlipped: boolean;
  onResign: () => void;
  onRematch: () => void;
  onHome: () => void;
}

function GameInfo({ 
  gameState, 
  config, 
  clock, 
  isFlipped,
  onResign, 
  onRematch, 
  onHome 
}: GameInfoProps) {
  const pieces = countPieces(gameState.board);
  const isGameOver = gameState.status !== 'playing' && gameState.status !== 'waiting';
  
  const topColor: PieceColor = isFlipped ? 'red' : 'black';
  const bottomColor: PieceColor = isFlipped ? 'black' : 'red';

  const { 
    viewingMoveIndex, 
    goToStart, 
    goToEnd, 
    goBack, 
    goForward,
    goToMove,
  } = useGameStore();

  const getPlayerLabel = (color: PieceColor) => {
    if (config.mode === 'computer') {
      return color === config.playerColor ? 'You' : 'Computer';
    }
    return color === 'red' ? 'Red' : 'Black';
  };

  const getStatusMessage = () => {
    if (gameState.status === 'red_wins') return 'Red wins!';
    if (gameState.status === 'black_wins') return 'Black wins!';
    if (gameState.status === 'draw') return 'Draw';
    return null;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goBack();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goForward();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        goToStart();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        goToEnd();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goBack, goForward, goToStart, goToEnd]);

  const isViewingHistory = viewingMoveIndex !== null;
  const currentMoveIndex = viewingMoveIndex ?? gameState.moves.length - 1;

  return (
    <div className="flex flex-col gap-2 w-64">
      {/* Top player */}
      <PlayerPanel
        color={topColor}
        label={getPlayerLabel(topColor)}
        pieces={pieces[topColor]}
        isActive={gameState.currentTurn === topColor && !isGameOver && !isViewingHistory}
        clock={clock}
      />

      {/* Game info card */}
      <div className="card p-3">
        {/* Status */}
        {isGameOver ? (
          <div className="text-center py-3">
            <div className="text-lg font-bold text-accent-green">
              {getStatusMessage()}
            </div>
          </div>
        ) : isViewingHistory ? (
          <div className="text-center py-2 text-yellow-500 text-sm">
            Viewing history
          </div>
        ) : (
          <div className="text-center py-2 text-text-secondary text-sm">
            {gameState.currentTurn === 'red' ? 'Red' : 'Black'} to move
            {gameState.mustCapture && (
              <span className="text-yellow-500 ml-2">• Must capture</span>
            )}
          </div>
        )}

        {/* Move list */}
        {gameState.moves.length > 0 && (
          <div className="bg-bg-primary rounded p-2 mb-3 max-h-40 overflow-y-auto">
            <div className="text-xs font-mono space-y-0.5">
              {gameState.moves.map((move, i) => {
                const moveNum = Math.floor(i / 2) + 1;
                const from = `${String.fromCharCode(97 + move.from.col)}${8 - move.from.row}`;
                const to = `${String.fromCharCode(97 + move.to.col)}${8 - move.to.row}`;
                const separator = move.captures?.length ? 'x' : '-';
                const isBlackMove = i % 2 === 0;
                const isCurrentMove = i === currentMoveIndex;
                const isSelected = i === viewingMoveIndex;
                
                return (
                  <div 
                    key={i} 
                    className={`flex cursor-pointer hover:bg-bg-hover rounded px-1 ${isSelected ? 'bg-accent-green/20' : ''}`}
                    onClick={() => goToMove(i)}
                  >
                    {isBlackMove && (
                      <span className="text-text-muted w-6">{moveNum}.</span>
                    )}
                    <span 
                      className={`${isBlackMove ? '' : 'ml-6'} ${isCurrentMove && !isViewingHistory ? 'text-accent-green font-bold' : 'text-text-primary'}`}
                    >
                      {from}{separator}{to}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Move navigation */}
        {gameState.moves.length > 0 && (
          <div className="flex justify-center gap-1 mb-3">
            <button
              className="p-1.5 rounded hover:bg-bg-hover text-text-secondary disabled:opacity-30"
              onClick={goToStart}
              disabled={viewingMoveIndex === -1}
              title="Go to start (↑)"
            >
              <ChevronFirst size={18} />
            </button>
            <button
              className="p-1.5 rounded hover:bg-bg-hover text-text-secondary disabled:opacity-30"
              onClick={goBack}
              disabled={viewingMoveIndex === -1}
              title="Previous move (←)"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              className="p-1.5 rounded hover:bg-bg-hover text-text-secondary disabled:opacity-30"
              onClick={goForward}
              disabled={viewingMoveIndex === null}
              title="Next move (→)"
            >
              <ChevronRight size={18} />
            </button>
            <button
              className="p-1.5 rounded hover:bg-bg-hover text-text-secondary disabled:opacity-30"
              onClick={goToEnd}
              disabled={viewingMoveIndex === null}
              title="Go to end (↓)"
            >
              <ChevronLast size={18} />
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {!isGameOver ? (
            <button
              className="btn btn-secondary flex-1 flex items-center justify-center gap-1.5 text-sm"
              onClick={onResign}
            >
              <Flag size={14} />
              Resign
            </button>
          ) : (
            <>
              <button
                className="btn btn-primary flex-1 flex items-center justify-center gap-1.5 text-sm"
                onClick={onRematch}
              >
                <RotateCcw size={14} />
                Rematch
              </button>
              <button
                className="btn btn-secondary px-3 flex items-center justify-center"
                onClick={onHome}
              >
                <Home size={14} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Bottom player */}
      <PlayerPanel
        color={bottomColor}
        label={getPlayerLabel(bottomColor)}
        pieces={pieces[bottomColor]}
        isActive={gameState.currentTurn === bottomColor && !isGameOver && !isViewingHistory}
        clock={clock}
      />
    </div>
  );
}

interface PlayerPanelProps {
  color: PieceColor;
  label: string;
  pieces: { men: number; kings: number };
  isActive: boolean;
  clock: ClockState | null;
}

function PlayerPanel({ color, label, pieces, isActive, clock }: PlayerPanelProps) {
  const totalPieces = pieces.men + pieces.kings;
  const captured = 12 - totalPieces;

  return (
    <div className={`card p-2 flex items-center justify-between ${isActive ? 'ring-2 ring-accent-green' : ''}`}>
      <div className="flex items-center gap-2">
        <div 
          className="w-4 h-4 rounded-full"
          style={{ 
            background: color === 'red' 
              ? 'radial-gradient(circle at 30% 30%, #e55, #a22)' 
              : 'radial-gradient(circle at 30% 30%, #555, #222)'
          }}
        />
        <span className="font-medium text-sm text-text-primary">{label}</span>
        {captured > 0 && (
          <span className="text-xs text-text-muted">
            -{captured}
          </span>
        )}
      </div>
      {clock && (
        <Clock color={color} clock={clock} isActive={isActive} />
      )}
    </div>
  );
}

export default memo(GameInfo);
