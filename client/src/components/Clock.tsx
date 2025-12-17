import { memo, useEffect } from 'react';
import { PieceColor, ClockState } from '@licheckers/shared';
import { useGameStore } from '../store/gameStore';

interface ClockProps {
  color: PieceColor;
  clock: ClockState;
  isActive: boolean;
}

function formatTime(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function Clock({ color, clock, isActive }: ClockProps) {
  const tickClock = useGameStore((state) => state.tickClock);
  const time = color === 'red' ? clock.redTime : clock.blackTime;
  const isLow = time < 30000;
  const isCritical = time < 10000;

  useEffect(() => {
    if (!isActive || !clock.isRunning) return;

    const interval = setInterval(() => {
      tickClock();
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, clock.isRunning, tickClock]);

  return (
    <div
      className={`
        px-3 py-2 rounded font-mono text-2xl font-bold tabular-nums
        ${isActive 
          ? isCritical 
            ? 'bg-red-600 text-white' 
            : isLow 
              ? 'bg-yellow-600 text-white' 
              : 'bg-white text-bg-primary'
          : 'bg-bg-secondary text-text-muted'
        }
      `}
    >
      {formatTime(time)}
    </div>
  );
}

export default memo(Clock);
