const Student = require('../api/students/students.model');

module.exports = server => {
  let onlineCount = 0;
  const messages = [
    {
      author: 'LATE',
      text: 'Welcome!',
      sentAt: new Date()
    }
  ];

  const io = require('socket.io')(server);
  require('socketio-auth')(io, {
    authenticate: function (socket, studentID, callback) {
      // get credentials sent by the client

      Student.findById(studentID, function (err, user) {
        // inform the callback of auth success/failure
        if (err || !user) return callback(new Error('User not found'));
        return callback(null, true);
      });
    },
    postAuthenticate: function (socket, studentID) {
      Student.findById(studentID, function (err, user) {
        if (err) return console.log(err);
        socket.client.user = user;
      });
    }
  });

  io.on('connection', socket => {
    onlineCount += 1;
    socket.emit('messages', messages);

    socket.emit('online count', onlineCount);

    console.log('Client connected to Socket.io');

    socket.on('get messages', () => {
      socket.emit('messages', messages);
    });

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
