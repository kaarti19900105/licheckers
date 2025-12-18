import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Users, User, Clock, Zap, Timer, Hourglass } from 'lucide-react';
import { Difficulty, TimeControl } from '@licheckers/shared';
import { TIME_CONTROLS } from '@licheckers/shared';

type TimeControlOption = {
  id: string;
  label: string;
  icon: React.ReactNode;
  value: TimeControl | null;
};

const timeControlOptions: TimeControlOption[] = [
  { id: 'unlimited', label: '∞', icon: <Hourglass size={16} />, value: null },
  { id: 'bullet-1', label: '1+0', icon: <Zap size={16} />, value: TIME_CONTROLS['bullet-1'] },
  { id: 'blitz-3', label: '3+0', icon: <Zap size={16} />, value: TIME_CONTROLS['blitz-3'] },
  { id: 'blitz-5+3', label: '5+3', icon: <Timer size={16} />, value: TIME_CONTROLS['blitz-5+3'] },
  { id: 'rapid-10', label: '10+0', icon: <Clock size={16} />, value: TIME_CONTROLS['rapid-10'] },
  { id: 'rapid-15+10', label: '15+10', icon: <Clock size={16} />, value: TIME_CONTROLS['rapid-15+10'] },
];

const difficultyOptions: { id: Difficulty; label: string }[] = [
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
  { id: 'expert', label: 'Expert' },
];

export default function Home() {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<'computer' | 'local' | 'online' | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('unlimited');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('medium');
  const [playerColor, setPlayerColor] = useState<'red' | 'black' | 'random'>('random');

  const handlePlay = () => {
    const timeControl = timeControlOptions.find(t => t.id === selectedTime)?.value;
    const params = new URLSearchParams();
    
    if (timeControl) {
      params.set('time', selectedTime);
    }
    
    if (selectedMode === 'computer') {
      params.set('difficulty', selectedDifficulty);
      const color = playerColor === 'random' 
        ? (Math.random() < 0.5 ? 'red' : 'black') 
        : playerColor;
      params.set('color', color);
    }
    
    navigate(`/play/${selectedMode}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-4 px-4 border-b border-border">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold text-text-primary">
            licheckers<span className="text-accent-green">.org</span>
          </h1>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Mode selection */}
          {!selectedMode && (
            <div className="space-y-3">
              <h2 className="text-text-secondary text-center mb-6">Play Checkers</h2>
              <ModeCard
                icon={<Bot size={24} />}
                title="Play with the computer"
                onClick={() => setSelectedMode('computer')}
              />
              <ModeCard
                icon={<User size={24} />}
                title="Play locally (2 players)"
                onClick={() => setSelectedMode('local')}
              />
              <ModeCard
                icon={<Users size={24} />}
                title="Play online"
                onClick={() => setSelectedMode('online')}
                disabled
                subtitle="Coming soon"
              />
            </div>
          )}

          {/* Game configuration */}
          {selectedMode && (
            <div className="card p-4 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-medium text-text-primary">
                  {selectedMode === 'computer' ? 'Play vs Computer' : 'Local Game'}
                </h2>
                <button 
                  className="text-text-muted hover:text-text-primary text-sm"
                  onClick={() => setSelectedMode(null)}
                >
                  ← Back
                </button>
              </div>

              {/* Time control */}
              <div>
                <label className="block text-xs text-text-muted mb-2 uppercase tracking-wide">
                  Time Control
                </label>
                <div className="grid grid-cols-6 gap-1">
                  {timeControlOptions.map((option) => (
                    <button
                      key={option.id}
                      className={`
                        flex flex-col items-center justify-center py-2 rounded text-sm
                        ${selectedTime === option.id
                          ? 'bg-accent-green text-white'
                          : 'bg-bg-primary text-text-secondary hover:bg-bg-hover'
                        }
                      `}
                      onClick={() => setSelectedTime(option.id)}
                    >
                      <span className="font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty (only for computer) */}
              {selectedMode === 'computer' && (
                <>
                  <div>
                    <label className="block text-xs text-text-muted mb-2 uppercase tracking-wide">
                      Difficulty
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                      {difficultyOptions.map((option) => (
                        <button
                          key={option.id}
                          className={`
                            py-2 rounded text-sm font-medium
                            ${selectedDifficulty === option.id
                              ? 'bg-accent-green text-white'
                              : 'bg-bg-primary text-text-secondary hover:bg-bg-hover'
                            }
                          `}
                          onClick={() => setSelectedDifficulty(option.id)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-text-muted mb-2 uppercase tracking-wide">
                      Color
                    </label>
                    <div className="grid grid-cols-3 gap-1">
                      {[
                        { id: 'black', label: 'Black' },
                        { id: 'random', label: 'Random' },
                        { id: 'red', label: 'Red' },
                      ].map((option) => (
                        <button
                          key={option.id}
                          className={`
                            flex items-center justify-center gap-2 py-2 rounded text-sm font-medium
                            ${playerColor === option.id
                              ? 'bg-accent-green text-white'
                              : 'bg-bg-primary text-text-secondary hover:bg-bg-hover'
                            }
                          `}
                          onClick={() => setPlayerColor(option.id as 'red' | 'black' | 'random')}
                        >
                          {option.id !== 'random' && (
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ 
                                background: option.id === 'red' 
                                  ? 'radial-gradient(circle at 30% 30%, #e55, #a22)' 
                                  : 'radial-gradient(circle at 30% 30%, #555, #222)'
                              }}
                            />
                          )}
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Play button */}
              <button
                className="btn btn-primary w-full py-3 text-base font-semibold mt-2"
                onClick={handlePlay}
              >
                Play
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-3 px-4 border-t border-border text-center text-text-muted text-xs">
        Free online checkers
      </footer>
    </div>
  );
}

function ModeCard({ 
  icon, 
  title, 
  subtitle,
  onClick, 
  disabled = false,
}: { 
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      className={`
        card w-full p-4 flex items-center gap-4 text-left
        ${disabled 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:bg-bg-hover cursor-pointer'
        }
      `}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      <div className="text-accent-green">
        {icon}
      </div>
      <div>
        <div className="font-medium text-text-primary">{title}</div>
        {subtitle && <div className="text-xs text-text-muted">{subtitle}</div>}
      </div>
    </button>
  );
}
