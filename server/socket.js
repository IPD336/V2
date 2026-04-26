const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

let io;
const userSockets = new Map(); // Maps userId to socketId

module.exports = {
  init: (server) => {
    io = socketIo(server, {
      cors: {
        origin: '*', // Adjust in production
        methods: ['GET', 'POST']
      }
    });

    io.use((socket, next) => {
      const token = socket.handshake.auth.token;
      if (!token) return next(new Error('Authentication error'));
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decoded.id;
        next();
      } catch (err) {
        next(new Error('Authentication error'));
      }
    });

    io.on('connection', (socket) => {
      console.log('User connected to socket:', socket.userId);
      userSockets.set(socket.userId.toString(), socket.id);

      socket.on('disconnect', () => {
        console.log('User disconnected:', socket.userId);
        if (userSockets.get(socket.userId.toString()) === socket.id) {
          userSockets.delete(socket.userId.toString());
        }
      });
    });

    return io;
  },
  
  getIo: () => {
    if (!io) throw new Error('Socket.io not initialized!');
    return io;
  },

  sendNotification: (userId, notification) => {
    if (!io) return;
    const socketId = userSockets.get(userId.toString());
    if (socketId) {
      io.to(socketId).emit('new_notification', notification);
    }
  }
};
