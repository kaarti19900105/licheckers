import { memo, useState } from 'react';
import { Board as BoardType, Position, Move } from '@licheckers/shared';
import Piece from './Piece';

interface BoardProps {
  board: BoardType;
  selectedPiece: Position | null;
  validMoves: Move[];
  lastMove: Move | null;
  isFlipped: boolean;
  onSquareClick: (pos: Position) => void;
  onDragStart?: (pos: Position) => void;
  onDrop?: (from: Position, to: Position) => void;
}

function Board({ 
  board, 
  selectedPiece, 
  validMoves, 
  lastMove, 
  isFlipped, 
  onSquareClick,
  onDragStart,
  onDrop,
}: BoardProps) {
  const [dragOverSquare, setDragOverSquare] = useState<Position | null>(null);
  const [draggingFrom, setDraggingFrom] = useState<Position | null>(null);
  
  const rows = isFlipped ? [...Array(8).keys()].reverse() : [...Array(8).keys()];
  const cols = isFlipped ? [...Array(8).keys()].reverse() : [...Array(8).keys()];

  const isValidMoveSquare = (row: number, col: number) => {
    return validMoves.some(m => m.to.row === row && m.to.col === col);
  };

  const isCaptureMove = (row: number, col: number) => {
    const move = validMoves.find(m => m.to.row === row && m.to.col === col);
    return move?.captures && move.captures.length > 0;
  };

  const isLastMoveSquare = (row: number, col: number) => {
    if (!lastMove) return false;
    return (
      (lastMove.from.row === row && lastMove.from.col === col) ||
      (lastMove.to.row === row && lastMove.to.col === col)
    );
  };

  const isSelected = (row: number, col: number) => {
    return selectedPiece?.row === row && selectedPiece?.col === col;
  };

  const handleDragStart = (pos: Position) => {
    setDraggingFrom(pos);
    onDragStart?.(pos);
  };

  const handleDragEnd = () => {
    setDraggingFrom(null);
    setDragOverSquare(null);
  };

  const handleDragOver = (e: React.DragEvent, pos: Position) => {
    e.preventDefault();
    if (isValidMoveSquare(pos.row, pos.col)) {
      setDragOverSquare(pos);
    }
  };

  const handleDragLeave = () => {
    setDragOverSquare(null);
  };

  const handleDrop = (e: React.DragEvent, to: Position) => {
    e.preventDefault();
    setDragOverSquare(null);
    
    if (draggingFrom && isValidMoveSquare(to.row, to.col)) {
      onDrop?.(draggingFrom, to);
    }
    setDraggingFrom(null);
  };

  return (
    <div className="board-container">
      <div className="board rounded overflow-hidden shadow-board select-none">
        {rows.map((row, rowIdx) => (
          <div key={row} className="flex">
            {cols.map((col, colIdx) => {
              const isDark = (row + col) % 2 === 1;
              const piece = board[row][col];
              const validMove = isValidMoveSquare(row, col);
              const captureMove = isCaptureMove(row, col);
              const lastMoveHighlight = isLastMoveSquare(row, col);
              const selected = isSelected(row, col);
              const isDragOver = dragOverSquare?.row === row && dragOverSquare?.col === col;
              const isBeingDragged = draggingFrom?.row === row && draggingFrom?.col === col;

              // Determine square color
              let bgColor = isDark ? 'bg-board-dark' : 'bg-board-light';
              if (selected || isBeingDragged) {
                bgColor = 'bg-board-selected';
              } else if (isDragOver && validMove) {
                bgColor = captureMove ? 'bg-red-400/50' : 'bg-board-hint';
              } else if (lastMoveHighlight) {
                bgColor = isDark ? 'bg-[#aaa23a]' : 'bg-board-lastMove';
              }

              return (
                <div
                  key={`${row}-${col}`}
                  className={`
                    w-16 h-16 relative flex items-center justify-center
                    ${bgColor}
                    ${isDark ? 'cursor-pointer' : ''}
                    transition-colors duration-100
                  `}
                  onClick={() => isDark && onSquareClick({ row, col })}
                  onDragOver={(e) => isDark && handleDragOver(e, { row, col })}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => isDark && handleDrop(e, { row, col })}
                >
                  {/* Coordinate labels */}
                  {colIdx === 0 && (
                    <span className="absolute left-0.5 top-0.5 text-xs font-medium opacity-60 pointer-events-none"
                      style={{ color: isDark ? '#f0d9b5' : '#b58863' }}>
                      {8 - row}
                    </span>
                  )}
                  {rowIdx === 7 && (
                    <span className="absolute right-0.5 bottom-0.5 text-xs font-medium opacity-60 pointer-events-none"
                      style={{ color: isDark ? '#f0d9b5' : '#b58863' }}>
                      {String.fromCharCode(97 + col)}
                    </span>
                  )}

                  {/* Valid move indicator */}
                  {validMove && !piece && !isDragOver && (
                    <div className={captureMove ? 'valid-capture-ring' : 'valid-move-dot'} />
                  )}

                  {/* Piece */}
                  {piece && (
                    <Piece
                      piece={piece}
                      isSelected={selected}
                      isDragging={isBeingDragged}
                      canCapture={validMove && captureMove}
                      onClick={() => onSquareClick({ row, col })}
                      onDragStart={() => handleDragStart({ row, col })}
                      onDragEnd={handleDragEnd}
                    />
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default memo(Board);
