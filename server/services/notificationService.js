const Notification = require('../models/Notification');
const socket = require('../socket');

async function createNotification(userId, type, message, relatedId) {
  const notif = await Notification.create({
    user: userId,
    type,
    message,
    relatedId,
  });

  socket.sendNotification(userId, notif);
  return notif;
}

module.exports = { createNotification };
