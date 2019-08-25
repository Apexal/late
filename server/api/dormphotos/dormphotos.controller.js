const logger = require('../../modules/logger')

const DormPhoto = require('./dormphotos.model')

async function getDormPhotos (ctx) {
  let dormPhotos

  try {
    dormPhotos = await DormPhoto.find({ confirmed: true })
  } catch (e) {
    logger.error(`Failed to get confirmed dorm photos: ${e}`)
    return ctx.internalServerError('There was an issue grabbing the dorm photos.')
  }

  ctx.ok({ dormPhotos })
}

module.exports = {
  getDormPhotos
}
