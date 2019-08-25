const fs = require('fs')
const aws = require('aws-sdk')
const s3 = new aws.S3()
const logger = require('../../modules/logger')

const uuidv4 = require('uuid/v4')

const DormPhoto = require('./dormphotos.model')

const uploadFile = async (dormKey, style, { name: fileName, path: filePath, type: fileType }) => {
  return new Promise((resolve, reject) => {
    const stream = fs.createReadStream(filePath)
    stream.on('error', function (err) {
      reject(err)
    })

    s3.upload(
      {
        ACL: 'public-read',
        Bucket: 'late-dorm-photos',
        Body: stream,
        Key: `dorm-photo-${dormKey}-${style}-${uuidv4()}`,
        ContentType: fileType
      },
      function (err, data) {
        if (err) {
          reject(err)
        } else if (data) {
          resolve({ key: data.Key, url: data.Location })
        }
      }
    )
  })
}

async function getDormPhotos (ctx) {
  let dormPhotos

  const query = {
    confirmed: true
  }

  if ('dormKey' in ctx.query) {
    query.dormKey = ctx.query.dormKey
  }

  if (ctx.state.user && ctx.state.user.admin && 'confirmed' in ctx.query) {
    console.log('yeet')
    query.confirmed = ctx.query.confirmed
  }

  console.log(query)

  try {
    dormPhotos = await DormPhoto.find(query)
  } catch (e) {
    logger.error(`Failed to get dorm photos: ${e}`)
    return ctx.internalServerError('There was an issue grabbing the dorm photos.')
  }

  ctx.ok({ dormPhotos })
}

async function uploadDormPhoto (ctx) {
  if (!ctx.request.files.photo) {
    return ctx.badRequest('You did not upload a photo!')
  }

  const { dormKey, style } = ctx.request.body

  if (!dormKey) {
    return ctx.badRequest('You did not specify the dorm!')
  }

  const { key, url } = await uploadFile(dormKey, style, ctx.request.files.photo)

  const newDormPhoto = new DormPhoto({
    _student: ctx.state.user, // might be none
    imageURL: url,
    dormKey,
    style,
    confirmed: false
  })

  try {
    await newDormPhoto.save()
  } catch (e) {
    logger.error(`Failed to upload dorm photo: ${e}`)
    return ctx.badRequest('There was an issue saving the photo!')
  }

  ctx.ok({ newDormPhoto })
}

module.exports = {
  getDormPhotos,
  uploadDormPhoto
}
