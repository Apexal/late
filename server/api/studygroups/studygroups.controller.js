const Group = require('./studygroups.model')

async function createStudyGroup (ctx) {
  const body = ctx.request.body

  const groupData = {
    _student: ctx.state.user,
    course: body.course,
    date: body.date,
    time: body.time,
    location: body.location,
    title: body.title,
    description: body.description,
    publicPrivate: body.publicPrivate,
    members: body.members
  }

  const newStudyGroup = new Group(groupData)

  try {
    await newStudyGroup.save()
  } catch (e) {
    console.log(e)
  }

  ctx.created({
    createdGroup: newStudyGroup
  })
}

async function getStudyGroups (ctx) {
  let studygroups
  try {
    studygroups = await Group.find({
      _student: ctx.state.user._id
    })
  } catch (e) {
    console.log('Could not find groups')
  }

  ctx.ok({
    studygroups
  })
}

async function getStudyGroup (ctx) {
  let studygroup
  try {
    studygroup = await Group.findOne({
      _id: ctx.params.groupID
    })
  } catch (e) {
    console.log('Could not find group')
  }

  ctx.ok({
    studygroup
  })
}

module.exports = {
  createStudyGroup,
  getStudyGroups,
  getStudyGroup
}
