const Student = require('../api/students/students.model')

const logger = require('./logger')

module.exports = server => {
  const sessionCounts = {} // { matraf: 2 }
  let online = [] // [matraf, matraff]

  const io = require('socket.io').listen(server)
  require('socketio-auth')(io, {
    authenticate: function (socket, studentID, callback) {
      // get credentials sent by the client

      Student.findById(studentID, function (err, user) {
        // inform the callback of auth success/failure
        if (err || !user) return callback(new Error('User not found'))
        return callback(null, true)
      })
    },
    postAuthenticate: function (socket, studentID) {
      Student.findById(studentID, function (err, user) {
        if (err) return logger.error(err)
        socket.client.user = user

        if (!sessionCounts[user.rcs_id]) {
          online.push(user.rcs_id)
          sessionCounts[user.rcs_id] = 1
          socket.to('notifications').emit('user online', user.rcs_id)
          logger.info(`${user.identifier} is now online`)
        } else {
          sessionCounts[user.rcs_id]++
        }

        io.emit('online', online)

        if (user.rcs_id === 'matraf') socket.join('notifications')
      })
    },
    disconnect: function (socket) {
      if (socket.client.user) {
        sessionCounts[socket.client.user.rcs_id]--
        if (sessionCounts[socket.client.user.rcs_id] === 0) {
          delete sessionCounts[socket.client.user.rcs_id]
          online = online.filter(rcsId => rcsId !== socket.client.user.rcs_id)
          io.emit('online', online)

          logger.info(`${socket.client.user.identifier} is now offline`)

          socket.to('notifications').emit('user offline', socket.client.user.rcs_id)
        }
      }
    },
    timeout: 10 * 1000
  })

  io.on('connection', socket => {
    logger.debug('Client connected to Socket.io')

    /* FUN */
    socket.on('send sis man message', (targetRcsID, message) => {
      const allSockets = io.sockets.sockets
      for (const sID in allSockets) {
        if (allSockets[sID].auth && allSockets[sID].client.user.rcs_id === targetRcsID) { allSockets[sID].emit('sis man message', message) }
      }
      logger.info(`${socket.client.user.identifier} sent SIS man message to ${targetRcsID}: "${message}"`)
    })
    /* end FUN */

    /* ANNOUNCEMENTS */
    socket.on('new announcement', newAnnouncement => {
      if (!socket.auth || !socket.client.user.admin) return

      socket.broadcast.emit('new announcement', newAnnouncement)
    })
    /* end ANNOUNCEMENTS */

    /* ASSESSMENTS */
    socket.on('join assessment room', assessmentID => {
      if (!socket.auth) return

      socket.join(`/assessments/${assessmentID}`)
      socket.to(`/assessments/${assessmentID}`).emit('collaborator joined assessment room', socket.client.user.rcs_id)
    })

    socket.on('join assessment rooms', assessmentIDS => {
      if (!socket.auth) return

      for (const id of assessmentIDS) {
        socket.join(`/assessments/${id}`)
      }
    })

    socket.on('leave assessment room', assessmentID => {
      if (!socket.auth) return

      socket.leave(`/assessments/${assessmentID}`)
      socket.to(`/assessments/${assessmentID}`).emit('collaborator left assessment room', socket.client.user.rcs_id)
    })

    socket.on('updated assessment', assessment => {
      if (!socket.auth) return

      socket.to(`/assessments/${assessment._id}`).emit('updated assessment', { collaboratorRcsId: socket.client.user.rcs_id, assessment })
    })

    socket.on('assessment whiteboard draw', (assessmentID, coords) => {
      if (!socket.auth) return

      socket.to(`/assessments/${assessmentID}`).emit('assessment whiteboard draw', coords)
    })
    /* end ASSESSMENTS */

    socket.on('disconnect', () => {
      logger.debug('Client disconnected from Socket.io')
    })
  })
}
