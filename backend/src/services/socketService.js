import { Server } from 'socket.io';

let io;

// Data Structure: showId -> seatLabel -> { userId, socketId, expiresAt, timerId }
const seatLocks = new Map();

const LOCK_DURATION_MS = 10 * 60 * 1000; // 10 minutes

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // User joins a specific show room to receive seat updates
    socket.on('joinShow', ({ showId }) => {
      console.log(`Socket ${socket.id} joining show: ${showId}`);
      socket.join(showId);
      
      // Send current locks for this show to the newly connected user
      const showLocks = seatLocks.get(showId) || new Map();
      const currentLocks = {};
      showLocks.forEach((lockData, seatLabel) => {
        currentLocks[seatLabel] = {
          userId: lockData.userId,
          expiresAt: lockData.expiresAt
        };
      });
      console.log(`Sending currentLocks to ${socket.id}:`, currentLocks);
      socket.emit('currentLocks', { showId, lockedSeats: currentLocks });
    });

    // Handle seat lock request
    socket.on('lockSeat', ({ showId, seatLabel, userId }) => {
      console.log(`Locking ${seatLabel} on show ${showId} for user ${userId}`);
      if (!seatLocks.has(showId)) {
        seatLocks.set(showId, new Map());
      }
      
      const showLocks = seatLocks.get(showId);
      
      // Check if already locked by someone else
      if (showLocks.has(seatLabel) && showLocks.get(seatLabel).userId !== userId) {
        socket.emit('lockError', { seatLabel, message: 'Seat is currently locked by another user' });
        return;
      }

      // If already locked by THIS user, clear old timer to reset it
      if (showLocks.has(seatLabel)) {
         clearTimeout(showLocks.get(seatLabel).timerId);
      }

      const expiresAt = Date.now() + LOCK_DURATION_MS;

      // Auto-unlock timer
      const timerId = setTimeout(() => {
        const currentLock = showLocks.get(seatLabel);
        if (currentLock && currentLock.timerId === timerId) {
          showLocks.delete(seatLabel);
          io.to(showId).emit('seatUnlocked', { showId, seatLabel });
        }
      }, LOCK_DURATION_MS);

      showLocks.set(seatLabel, { userId, socketId: socket.id, expiresAt, timerId });

      // Broadcast to everyone in the room that the seat is blocked
      io.to(showId).emit('seatLocked', { showId, seatLabel, userId, expiresAt });
    });

    // Handle manual seat unlock request
    socket.on('unlockSeat', ({ showId, seatLabel, userId }) => {
      const showLocks = seatLocks.get(showId);
      if (!showLocks) return;

      const lockData = showLocks.get(seatLabel);
      if (lockData && lockData.userId === userId) {
        clearTimeout(lockData.timerId);
        showLocks.delete(seatLabel);
        io.to(showId).emit('seatUnlocked', { showId, seatLabel });
      }
    });

    // Clean up all locks from this socket on disconnect
    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
      seatLocks.forEach((showLocks, showId) => {
        showLocks.forEach((lockData, seatLabel) => {
          if (lockData.socketId === socket.id) {
            clearTimeout(lockData.timerId);
            showLocks.delete(seatLabel);
            io.to(showId).emit('seatUnlocked', { showId, seatLabel });
          }
        });
        if (showLocks.size === 0) {
          seatLocks.delete(showId);
        }
      });
    });
  });
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

// Helper for booking controller to check if seats are locked by another user
export const isSeatLockedByAnotherUser = (showId, seatLabel, requestingUserId) => {
  const showLocks = seatLocks.get(showId?.toString());
  if (!showLocks) return false;
  
  const lockData = showLocks.get(seatLabel);
  if (!lockData) return false;

  return lockData.userId !== requestingUserId?.toString();
};

// Helper to clear locks and emit booked event after successful booking
export const clearLocksAndEmitBooked = (showId, bookedSeats, userId) => {
  const showLocks = seatLocks.get(showId?.toString());
  
  if (showLocks) {
    bookedSeats.forEach((seatLabel) => {
      const lockData = showLocks.get(seatLabel);
      if (lockData) {
        clearTimeout(lockData.timerId);
        showLocks.delete(seatLabel);
      }
    });
  }

  if (io) {
    io.to(showId?.toString()).emit('seatsBooked', { 
      showId: showId?.toString(), 
      seats: bookedSeats 
    });
  }
};
