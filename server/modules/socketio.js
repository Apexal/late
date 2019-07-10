const Student = require('../api/students/students.model');

const logger = require('./logger');

module.exports = server => {
  let online = [];

  const io = require('socket.io').listen(server);
  require('socketio-auth')(io, {
    authenticate: function (socket, studentID, callback) {
      // get credentials sent by the client

      Student.findById(studentID, function (err, user) {
        // inform the callback of auth success/failure
        if (err || !user) return callback(new Error('User not found'));
        logger.info(`Authenticated socket for ${user.rcs_id}`);
        return callback(null, true);
      });
    },
    postAuthenticate: function (socket, studentID) {
      Student.findById(studentID, function (err, user) {
        if (err) return console.log(err);
        socket.client.user = user;
        online.push(user.rcs_id);
        socket.emit('online', online);
      });
    },
    disconnect: function (socket) {
      if (socket.client.user) { online = online.filter(rcsId => rcsId !== socket.client.user.rcs_id); }
      socket.emit('online', online);
    },
    timeout: 10 * 1000
  });

  io.on('connection', socket => {
    logger.debug('Client connected to Socket.io');

    socket.on('join assessment room', assessmentID => {
      logger.info(`${socket.client.user.rcs_id} is joining assessment room: ${assessmentID}`);
      socket.join(`/assessments/${assessmentID}`);
      socket.to(`/assessments/${assessmentID}`).emit('collaborator joined assessment room', socket.client.user.rcs_id);
    });

    socket.on('leave assessment room', assessmentID => {
      logger.info(`${socket.client.user.rcs_id} is leaving assessment room: ${assessmentID}`);
      socket.leave(`/assessments/${assessmentID}`);
      socket.to(`/assessments/${assessmentID}`).emit('collaborator left assessment room', socket.client.user.rcs_id);
    });

    socket.on('updated assessment', assessmentID => {
      socket.to(`/assessments/${assessmentID}`).emit('updated assessment');
    });

    socket.on('disconnect', () => {
      logger.debug('Client disconnected from Socket.io');
    });
  });
};
