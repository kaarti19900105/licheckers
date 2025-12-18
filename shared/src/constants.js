export const BOARD_SIZE = 8;
// Time control presets (in milliseconds)
export const TIME_CONTROLS = {
    'bullet-1': { initialTime: 60000, increment: 0 },
    'bullet-2+1': { initialTime: 120000, increment: 1000 },
    'blitz-3': { initialTime: 180000, increment: 0 },
    'blitz-3+2': { initialTime: 180000, increment: 2000 },
    'blitz-5': { initialTime: 300000, increment: 0 },
    'blitz-5+3': { initialTime: 300000, increment: 3000 },
    'rapid-10': { initialTime: 600000, increment: 0 },
    'rapid-10+5': { initialTime: 600000, increment: 5000 },
    'rapid-15+10': { initialTime: 900000, increment: 10000 },
    'classical-30': { initialTime: 1800000, increment: 0 },
    'classical-30+20': { initialTime: 1800000, increment: 20000 },
};
// AI search depths by difficulty
export const AI_DEPTHS = {
    easy: 2,
    medium: 4,
    hard: 6,
    expert: 8,
};
// Piece values for AI evaluation
export const PIECE_VALUES = {
    man: 100,
    king: 300,
};
// Position bonuses for AI evaluation (center control, advancement)
export const POSITION_BONUS = {
    center: 10,
    advancement: 5,
    backRow: 15, // Protecting back row pieces
};
