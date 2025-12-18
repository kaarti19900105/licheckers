import { TimeControl } from './types';
export declare const BOARD_SIZE = 8;
export declare const TIME_CONTROLS: Record<string, TimeControl>;
export declare const AI_DEPTHS: Record<string, number>;
export declare const PIECE_VALUES: {
    man: number;
    king: number;
};
export declare const POSITION_BONUS: {
    center: number;
    advancement: number;
    backRow: number;
};
