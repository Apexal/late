module.exports = server => {
  let onlineCount = 0;
  const messages = [];

  const io = require('socket.io')(server);
  io.on('connection', socket => {
    onlineCount += 1;
    socket.emit('messages', messages);

    socket.emit('online count', onlineCount);

    console.log('Client connected to Socket.io');

    socket.on('message', message => {
      messages.push({ sentAt: new Date(), ...message });
      io.emit('messages', messages);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected from Socket.io');
      onlineCount -= 1;
      socket.emit('online count', onlineCount);
    });
  });
};
