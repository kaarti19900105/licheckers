import { memo } from 'react';
import { Piece as PieceType } from '@licheckers/shared';

interface PieceProps {
  piece: PieceType;
  isSelected: boolean;
  isDragging?: boolean;
  canCapture?: boolean;
  onClick: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

function Piece({ 
  piece, 
  isSelected, 
  isDragging,
  canCapture, 
  onClick,
  onDragStart,
  onDragEnd,
}: PieceProps) {
  const isRed = piece.color === 'red';
  const isKing = piece.type === 'king';

  const handleDragStart = (e: React.DragEvent) => {
    // Set drag image to be the piece itself
    const target = e.target as HTMLElement;
    e.dataTransfer.setDragImage(target, 26, 26);
    e.dataTransfer.effectAllowed = 'move';
    onDragStart?.();
  };

  return (
    <div
      className={`
        piece w-[52px] h-[52px] rounded-full relative shadow-piece
        cursor-grab active:cursor-grabbing
        ${isSelected ? 'selected ring-2 ring-yellow-400' : ''}
        ${isDragging ? 'opacity-50 scale-90' : ''}
        transition-all duration-100
      `}
      draggable
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      style={{
        background: isRed 
          ? 'radial-gradient(circle at 30% 30%, #e55, #a22)' 
          : 'radial-gradient(circle at 30% 30%, #555, #222)',
        border: `3px solid ${isRed ? '#811' : '#111'}`,
      }}
    >
      {/* Inner ring for 3D effect */}
      <div 
        className="absolute rounded-full pointer-events-none"
        style={{
          top: '6px',
          left: '6px',
          right: '6px',
          bottom: '6px',
          border: `2px solid ${isRed ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.1)'}`,
        }}
      />

      {/* King indicator */}
      {isKing && (
        <div 
          className="absolute inset-0 flex items-center justify-center text-2xl font-bold pointer-events-none"
          style={{ color: isRed ? '#ffd700' : '#daa520' }}
        >
          ♔
        </div>
      )}

      {/* Capture indicator ring */}
      {canCapture && (
        <div 
          className="absolute -inset-1 rounded-full border-4 border-black/20 pointer-events-none"
        />
      )}
    </div>
  );
}

export default memo(Piece);
