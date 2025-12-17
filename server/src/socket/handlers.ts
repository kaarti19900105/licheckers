import { Server, Socket } from 'socket.io';
import {
  GameRoom,
  GameConfig,
  Move,
  TimeControl,
} from '../../../shared/src/types.js';
import {
  createInitialGameState,
  makeMove,
  isValidMove,
  getAllValidMoves,
} from '../../../shared/src/checkers.js';
import { v4 as uuidv4 } from 'uuid';

// In-memory game storage (replace with database later)
const games = new Map<string, GameRoom>();
const playerToGame = new Map<string, string>();

// Matchmaking queues by time control
const matchmakingQueues = new Map<string, Set<string>>();

export function setupSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Create a new game room
    socket.on('game:create', (config: GameConfig) => {
      const roomId = uuidv4();
      const gameState = createInitialGameState();
      
      const room: GameRoom = {
        id: roomId,
        players: {
          red: null,
          black: socket.id,
        },
        config,
        state: gameState,
        clock: config.timeControl ? {
          redTime: config.timeControl.initialTime,
          blackTime: config.timeControl.initialTime,
          isRunning: false,
          activeColor: null,
        } : null,
      };

      games.set(roomId, room);
      playerToGame.set(socket.id, roomId);
      socket.join(roomId);

      socket.emit('game:created', { roomId, room });
      console.log(`Game created: ${roomId}`);
    });

    // Join an existing game
    socket.on('game:join', (roomId: string) => {
      const room = games.get(roomId);
      
      if (!room) {
        socket.emit('error', 'Game not found');
        return;
      }

      if (room.players.red && room.players.black) {
        socket.emit('error', 'Game is full');
        return;
      }

      // Assign player to available color
      if (!room.players.red) {
        room.players.red = socket.id;
      } else {
        room.players.black = socket.id;
      }

      playerToGame.set(socket.id, roomId);
      socket.join(roomId);

      // Start the game
      room.state.status = 'playing';
      if (room.clock) {
        room.clock.isRunning = true;
        room.clock.activeColor = 'black';
      }

      io.to(roomId).emit('game:started', room);
      console.log(`Player ${socket.id} joined game ${roomId}`);
    });

    // Make a move
    socket.on('game:move', (move: Move) => {
      const roomId = playerToGame.get(socket.id);
      if (!roomId) return;

      const room = games.get(roomId);
      if (!room) return;

      // Verify it's this player's turn
      const playerColor = room.players.red === socket.id ? 'red' : 'black';
      if (room.state.currentTurn !== playerColor) {
        socket.emit('error', 'Not your turn');
        return;
      }

      // Validate and apply move
      if (!isValidMove(room.state.board, playerColor, move)) {
        socket.emit('error', 'Invalid move');
        return;
      }

      room.state = makeMove(room.state, move);

      // Update clock
      if (room.clock && room.config.timeControl) {
        const timeKey = playerColor === 'red' ? 'redTime' : 'blackTime';
        room.clock[timeKey] += room.config.timeControl.increment;
        room.clock.activeColor = room.state.currentTurn;
      }

      io.to(roomId).emit('game:state', room.state);
      if (room.clock) {
        io.to(roomId).emit('clock:update', room.clock);
      }

      // Check for game end
      if (room.state.status !== 'playing') {
        const winner = room.state.status === 'red_wins' ? 'red' : 
                       room.state.status === 'black_wins' ? 'black' : 'draw';
        io.to(roomId).emit('game:ended', { 
          winner, 
          reason: 'No moves available' 
        });
      }
    });

    // Resign
    socket.on('game:resign', () => {
      const roomId = playerToGame.get(socket.id);
      if (!roomId) return;

      const room = games.get(roomId);
      if (!room) return;

      const playerColor = room.players.red === socket.id ? 'red' : 'black';
      const winner = playerColor === 'red' ? 'black' : 'red';

      room.state.status = winner === 'red' ? 'red_wins' : 'black_wins';
      if (room.clock) {
        room.clock.isRunning = false;
      }

      io.to(roomId).emit('game:ended', { winner, reason: 'Resignation' });
    });

    // Join matchmaking queue
    socket.on('matchmaking:join', (timeControl: TimeControl) => {
      const queueKey = `${timeControl.initialTime}-${timeControl.increment}`;
      
      if (!matchmakingQueues.has(queueKey)) {
        matchmakingQueues.set(queueKey, new Set());
      }

      const queue = matchmakingQueues.get(queueKey)!;
      
      // Check if there's already someone waiting
      if (queue.size > 0) {
        const opponent = queue.values().next().value;
        if (!opponent) {
          queue.add(socket.id);
          socket.emit('matchmaking:waiting');
          return;
        }
        queue.delete(opponent);

        // Create game
        const roomId = uuidv4();
        const gameState = createInitialGameState();
        
        // Randomly assign colors
        const [black, red] = Math.random() < 0.5 
          ? [socket.id, opponent] 
          : [opponent, socket.id];

        const room: GameRoom = {
          id: roomId,
          players: { red, black },
          config: {
            mode: 'online',
            timeControl,
          },
          state: gameState,
          clock: {
            redTime: timeControl.initialTime,
            blackTime: timeControl.initialTime,
            isRunning: true,
            activeColor: 'black',
          },
        };

        games.set(roomId, room);
        playerToGame.set(socket.id, roomId);
        playerToGame.set(opponent, roomId);

        socket.join(roomId);
        io.sockets.sockets.get(opponent)?.join(roomId);

        io.to(roomId).emit('match:found', roomId);
        io.to(roomId).emit('game:started', room);

        console.log(`Match found: ${roomId}`);
      } else {
        queue.add(socket.id);
        socket.emit('matchmaking:waiting');
      }
    });

    // Leave matchmaking queue
    socket.on('matchmaking:leave', () => {
      matchmakingQueues.forEach((queue) => {
        queue.delete(socket.id);
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      console.log(`Player disconnected: ${socket.id}`);
      
      // Remove from matchmaking
      matchmakingQueues.forEach((queue) => {
        queue.delete(socket.id);
      });

      // Handle game abandonment
      const roomId = playerToGame.get(socket.id);
      if (roomId) {
        const room = games.get(roomId);
        if (room && room.state.status === 'playing') {
          const playerColor = room.players.red === socket.id ? 'red' : 'black';
          const winner = playerColor === 'red' ? 'black' : 'red';
          
          room.state.status = winner === 'red' ? 'red_wins' : 'black_wins';
          io.to(roomId).emit('game:ended', { winner, reason: 'Opponent disconnected' });
        }
        playerToGame.delete(socket.id);
      }
    });
  });
}

