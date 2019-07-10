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
        if (err) return logger.error(err);
        socket.client.user = user;
        online.push(user.rcs_id);
        io.emit('online', online);
      });
    },
    disconnect: function (socket) {
      if (socket.client.user) { online = online.filter(rcsId => rcsId !== socket.client.user.rcs_id); }
      io.emit('online', online);
    },
    timeout: 10 * 1000
  });

  io.on('connection', socket => {
    logger.debug('Client connected to Socket.io');

    /* FUN */
    socket.on('send sis man message', (targetRcsID, message) => {
      const allSockets = io.sockets.sockets;
      for (let sID in allSockets) {
        if (allSockets[sID].auth && allSockets[sID].client.user.rcs_id === targetRcsID) { allSockets[sID].emit('sis man message', message); }
      }
    });
    /* end FUN */

    /* ANNOUNCEMENTS */
    socket.on('new announcement', newAnnouncement => {
      if (!socket.auth || !socket.client.user.admin) return;

      socket.broadcast.emit('new announcement', newAnnouncement);
    });
    /* end ANNOUNCEMENTS */

    /* ASSESSMENTS */
    socket.on('join assessment room', assessmentID => {
      if (!socket.auth) return;

      logger.info(`${socket.client.user.rcs_id} is joining assessment room: ${assessmentID}`);
      socket.join(`/assessments/${assessmentID}`);
      socket.to(`/assessments/${assessmentID}`).emit('collaborator joined assessment room', socket.client.user.rcs_id);
    });

    socket.on('join assessment rooms', assessmentIDS => {
      if (!socket.auth) return;

      logger.info(`${socket.client.user.rcs_id} is joining ${assessmentIDS.length} assessment rooms`);
      for (let id of assessmentIDS) {
        socket.join(`/assessments/${id}`);
      }
    });

    socket.on('leave assessment room', assessmentID => {
      if (!socket.auth) return;

      logger.info(`${socket.client.user.rcs_id} is leaving assessment room: ${assessmentID}`);
      socket.leave(`/assessments/${assessmentID}`);
      socket.to(`/assessments/${assessmentID}`).emit('collaborator left assessment room', socket.client.user.rcs_id);
    });

    socket.on('updated assessment', assessment => {
      if (!socket.auth) return;

      socket.to(`/assessments/${assessment._id}`).emit('updated assessment', { assessment });
    });
    /* end ASSESSMENTS */

    socket.on('disconnect', () => {
      logger.debug('Client disconnected from Socket.io');
    });
  });
};
