const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('./models/Message');
const Swap = require('./models/Swap');
const Team = require('./models/Team');

let io;
const userSockets = new Map(); // userId -> Set of socketIds

const TYPING_TIMEOUT = 3000; // ms before auto-stopping typing

module.exports = {
  init: (server) => {
    io = socketIo(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
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
      const uid = socket.userId.toString();
      console.log('User connected to socket:', uid);

      // Track sockets per user (support multiple tabs)
      if (!userSockets.has(uid)) userSockets.set(uid, new Set());
      userSockets.get(uid).add(socket.id);

      // Broadcast online to everyone & notify this user of current online users
      socket.broadcast.emit('user_online', uid);
      socket.emit('online_users', Array.from(userSockets.keys()));

      // Room management
      socket.on('join_room', async (roomId) => {
        let allowed = false;
        try {
          if (roomId.startsWith('DM_')) {
            const parts = roomId.split('_');
            allowed = parts.includes(uid);
          } else if (roomId.startsWith('swap_')) {
            const swapId = roomId.replace('swap_', '');
            const swap = await Swap.findById(swapId).select('sender receiver').lean();
            if (swap) {
              const id = swap.sender.toString();
              allowed = id === uid || swap.receiver.toString() === uid;
            }
          } else if (roomId.startsWith('team_')) {
            const teamId = roomId.replace('team_', '');
            const team = await Team.findById(teamId).select('members').lean();
            if (team) {
              allowed = team.members.some(m => m.user.toString() === uid);
            }
          }
        } catch (err) {
          console.error('join_room auth error:', err);
        }
        if (allowed) {
          socket.join(roomId);
        }
      });

      // Chat messages
      socket.on('send_message', async (data) => {
        const { room, content, type = 'text' } = data;
        try {
          const msg = await Message.create({ room, sender: socket.userId, content, type });
          await msg.populate('sender', 'name avatarUrl avatarColor');
          io.to(room).emit('new_message', msg);

          // If DM, also emit to recipient's individual socket connections
          if (room.startsWith('DM_')) {
            const parts = room.split('_'); // ['DM', 'id1', 'id2']
            const recipientId = parts[1] === socket.userId.toString() ? parts[2] : parts[1];
            const recipientSockets = userSockets.get(recipientId);
            if (recipientSockets) {
              for (const sid of recipientSockets) {
                io.to(sid).emit('new_message', msg);
              }
            }
          }
        } catch (err) {
          console.error('Error saving message:', err);
        }
      });

      // Typing indicators
      const typingTimers = new Map(); // room -> Map(userId -> timeout)

      socket.on('typing', (roomId) => {
        socket.to(roomId).emit('user_typing', { userId: uid, room: roomId });

        // Auto-stop typing after TYPING_TIMEOUT of inactivity
        if (!typingTimers.has(roomId)) typingTimers.set(roomId, new Map());
        const roomTimers = typingTimers.get(roomId);
        if (roomTimers.has(uid)) clearTimeout(roomTimers.get(uid));
        roomTimers.set(uid, setTimeout(() => {
          socket.to(roomId).emit('user_stop_typing', { userId: uid, room: roomId });
          roomTimers.delete(uid);
          if (roomTimers.size === 0) typingTimers.delete(roomId);
        }, TYPING_TIMEOUT));
      });

      socket.on('stop_typing', (roomId) => {
        socket.to(roomId).emit('user_stop_typing', { userId: uid, room: roomId });
        if (typingTimers.has(roomId)) {
          const roomTimers = typingTimers.get(roomId);
          if (roomTimers.has(uid)) {
            clearTimeout(roomTimers.get(uid));
            roomTimers.delete(uid);
          }
          if (roomTimers.size === 0) typingTimers.delete(roomId);
        }
      });

      // Goals
      socket.on('add_goal', async (data) => {
        const { room, type, text } = data;
        const Model = type === 'swap' ? Swap : Team;
        try {
          const item = await Model.findById(room);
          if (!item) return;
          const isParty = type === 'swap'
            ? [item.sender.toString(), item.receiver.toString()].includes(uid)
            : item.members.some(m => m.user.toString() === uid);
          if (!isParty) return;
          item.goals.push({ text, createdBy: socket.userId });
          await item.save();
          io.to(room).emit('goal_updated', item.goals);
        } catch (err) {
          console.error('Error adding goal:', err);
        }
      });

      socket.on('toggle_goal', async (data) => {
        const { room, type, goalId } = data;
        const Model = type === 'swap' ? Swap : Team;
        try {
          const item = await Model.findById(room);
          if (!item) return;
          const isParty = type === 'swap'
            ? [item.sender.toString(), item.receiver.toString()].includes(uid)
            : item.members.some(m => m.user.toString() === uid);
          if (!isParty) return;
          const goal = item.goals.id(goalId);
          if (goal) {
            goal.completed = !goal.completed;
            await item.save();
            io.to(room).emit('goal_updated', item.goals);
          }
        } catch (err) {
          console.error('Error toggling goal:', err);
        }
      });

      socket.on('disconnect', () => {
        console.log('User disconnected from socket:', uid);
        const sockets = userSockets.get(uid);
        if (sockets) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            userSockets.delete(uid);

            // Broadcast offline to everyone
            socket.broadcast.emit('user_offline', uid);

            // Clear any typing timers for this user
            for (const [roomId, roomTimers] of typingTimers) {
              if (roomTimers.has(uid)) {
                clearTimeout(roomTimers.get(uid));
                roomTimers.delete(uid);
                socket.to(roomId).emit('user_stop_typing', { userId: uid, room: roomId });
              }
              if (roomTimers.size === 0) typingTimers.delete(roomId);
            }
          }
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
    const sockets = userSockets.get(userId.toString());
    if (sockets) {
      for (const sid of sockets) {
        io.to(sid).emit('new_notification', notification);
      }
    }
  }
};
