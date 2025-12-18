import { Board, PieceColor, Position, Move, GameState, Square, GameStatus } from './types';
export declare function createInitialBoard(): Board;
export declare function createInitialGameState(): GameState;
export declare function isValidPosition(pos: Position): boolean;
export declare function isDarkSquare(row: number, col: number): boolean;
export declare function getPiece(board: Board, pos: Position): Square;
export declare function getOpponentColor(color: PieceColor): PieceColor;
export declare function getValidMovesForPiece(board: Board, pos: Position): Move[];
export declare function getAllValidMoves(board: Board, color: PieceColor): Move[];
export declare function isValidMove(board: Board, color: PieceColor, move: Move): boolean;
export declare function applyMove(board: Board, move: Move): Board;
export declare function checkGameEnd(board: Board, currentTurn: PieceColor): GameStatus;
export declare function countPieces(board: Board): {
    red: {
        men: number;
        kings: number;
    };
    black: {
        men: number;
        kings: number;
    };
};
export declare function makeMove(state: GameState, move: Move): GameState;
export declare function cloneGameState(state: GameState): GameState;
export declare function positionsEqual(a: Position, b: Position): boolean;
export declare function positionToNotation(pos: Position): string;
export declare function moveToNotation(move: Move): string;
