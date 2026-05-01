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

      socket.on('join_room', (roomId) => {
        socket.join(roomId);
        console.log(`User ${socket.userId} joined room ${roomId}`);
      });

      socket.on('send_message', async (data) => {
        const { room, content, type = 'text' } = data;
        const Message = require('./models/Message');
        const User = require('./models/User');
        
        try {
          const msg = await Message.create({ room, sender: socket.userId, content, type });
          const populatedMsg = await Message.findById(msg._id).populate('sender', 'name avatarUrl avatarColor');
          io.to(room).emit('new_message', populatedMsg);
        } catch (err) {
          console.error('Error saving message:', err);
        }
      });

      socket.on('add_goal', async (data) => {
        const { room, type, text } = data; // type: 'swap' | 'team'
        const Model = type === 'swap' ? require('./models/Swap') : require('./models/Team');
        
        try {
          const item = await Model.findById(room);
          if (item) {
            item.goals.push({ text, createdBy: socket.userId });
            await item.save();
            io.to(room).emit('goal_updated', item.goals);
          }
        } catch (err) {
          console.error('Error adding goal:', err);
        }
      });

      socket.on('toggle_goal', async (data) => {
        const { room, type, goalId } = data;
        const Model = type === 'swap' ? require('./models/Swap') : require('./models/Team');
        
        try {
          const item = await Model.findById(room);
          if (item) {
            const goal = item.goals.id(goalId);
            if (goal) {
              goal.completed = !goal.completed;
              await item.save();
              io.to(room).emit('goal_updated', item.goals);
            }
          }
        } catch (err) {
          console.error('Error toggling goal:', err);
        }
      });

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
