const logger = require('../../modules/logger')
const fs = require('fs').promises
const path = require('path')

const Student = require('./students.model')
const Assignment = require('../assignments/assignments.model')
const Exam = require('../exams/exams.model')
const Block = require('../blocks/blocks.model')

/**
 * Only available in development mode. Login as a user given their ID.
 * The url query must have `loginAs` set to the student rcs_id
 *
 * @param {Koa session} ctx
 **/
async function loginAs (ctx) {
  if (ctx.state.env !== 'development') {
    return ctx.forbidden('Nice try, hackerman.')
  }

  const rcsID = ctx.request.query.rcs_id

  logger.info(`Logging in as ${rcsID}`)

  let student = await Student.findOne()
    .byUsername(rcsID)
    .exec()

  if (!student) {
    student = Student({
      rcs_id: rcsID,
      lastLogin: new Date(),
      admin: true // Users on the dev server will only be admins
    })
    await student.save()
    logger.info('Created new user for testing.')
  }

  await ctx.login(student)

  await getUser(ctx)
}

/**
 * Return the logged in user.
 *
 * @param {Koa context} ctx
 */
async function getUser (ctx) {
  ctx.ok({
    user: ctx.state.user
  })
}

/**
 * Edit the current user's document
 *
 * Request body should be object of updates, e.g.:
 * { graduationYear: 2022, name: { first: 'Foo', last: 'bar' } }
 *
 * @param {Koa context} ctx
 * @returns The updated current student
 */
async function editUser (ctx) {
  delete ctx.request.body._id // Cannot change a user's _id!
  delete ctx.request.body.rcs_id // Cannot change a user's rcs_id!

  ctx.state.user.set(ctx.request.body)

  try {
    await ctx.state.user.save()
  } catch (e) {
    logger.error(
      `Failed to update self ${ctx.state.user.identifier}: ${e}`
    )
    return ctx.badRequest('There was an error updating your account.')
  }

  logger.info(`${ctx.state.user.identifier} updated their account.`)

  ctx.ok({
    updatedUser: ctx.state.user
  })
}

/**
 * For administrators, get all student documents.
 *
 * @param {Koa context} ctx
 */
async function getStudents (ctx) {
  const page = parseInt(ctx.query.page) || 1
  const itemsPerPage = parseInt(ctx.query.itemsPerPage) || 25
  const search = ctx.query.search || ''

  if (!ctx.state.user.admin) {
    return ctx.forbidden('You are not an administrator!')
  }

  const searchObject = formSearchObject(search)
  if (search) {
    logger.info(ctx.state.user.rcs_id + ' searched user list with term: ' + search)
  }

  const students = await Student.find(searchObject).sort('rcs_id').skip((page - 1) * itemsPerPage).limit(itemsPerPage)
  const studentCount = await Student.countDocuments(searchObject)
  ctx.ok({ students, studentCount })
}

/**
 * Parse the passed search string for a mongoose-friendly object that can be
 * passed to the find function and get the searched terms.
 * @param str {string} Entirety of the search string, typically what the user enters into the search input
 */
function formSearchObject (str) {
  if (typeof str !== 'string' || str.length === 0) {
    return {}
  }
  str = str.substr(0, 1000)

  // filter out the admin, locked, and year filters
  const filter = {}
  let filterResults = checkForAdminFilter(str)
  Object.assign(filter, filterResults.filter)
  filterResults = checkForLockedFilter(filterResults.str)
  Object.assign(filter, filterResults.filter)
  filterResults = checkForYearFilters(filterResults.str)
  str = filterResults.str
  Object.assign(filter, filterResults.filter)

  // Form regex for the name/rcs id searching
  let regexStr = '.*'
  regexStr += str
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // https://stackoverflow.com/a/6969486
    .replace(/ +/g, ' ') // Remove duplicate spaces
    .replace(' ', '|') // Convert each space into OR
  regexStr += '.*'
  const regex = new RegExp(regexStr, 'i')

  return Object.assign({
    $or: [
      { 'name.first': regex },
      { 'name.preferred': regex },
      { 'name.last': regex },
      { rcs_id: regex }
    ]
  }, filter)
}

/**
 * Filter out the is:admin filter from a search string in favor of
 * the Mongo-friendly object to be passed to find().
 * @see formSearchObject
 * @param str The search string to filter. Expected to be non-null.
 * @returns {{filter: Object, str: string}} Contains the new filter object for
 *          mongo along with the string that no longer contains the filter.
 */
function checkForAdminFilter (str) {
  const adminFilter = /(?:\s|^)(!?)is:admin(?:\s|$)/i
  const filter = {}
  let matchResult
  while ((matchResult = str.match(adminFilter)) !== null) {
    filter.admin = !(matchResult[1]) // Negate if there exists an ! in the search term
    str = str.replace(adminFilter, '')
  }
  return { filter, str }
}

/**
 * Filter out the is:locked filter from a search string in favor of
 * the Mongo-friendly object to be passed to find().
 * @see formSearchObject
 * @param str The search string to filter. Expected to be non-null.
 * @returns {{filter: Object, str: string}} Contains the new filter object for
 *          mongo along with the string that no longer contains the filter.
 */
function checkForLockedFilter (str) {
  const lockedFilter = /(?:\s|^)(!?)is:locked(?:\s|$)/i
  const filter = {}
  let matchResult
  while ((matchResult = str.match(lockedFilter)) !== null) {
    filter.accountLocked = !(matchResult[1]) // Negate if there exists an ! in the search term
    str = str.replace(lockedFilter, '')
  }
  return { filter, str }
}

/**
 * Filter out any year:#### filters from the passed search string in
 * favor of the Mongo-friendly object to be passed to find().
 * Multiple year:#### filters are valid.
 * @see formSearchObject
 * @param str The search string to filter. Expected to be non-null.
 * @returns {{filter: Object, str: string}} Contains the new filter object for
 *          mongo along with the string that no longer contains the filter.
 */
function checkForYearFilters (str) {
  const yearFilter = /(?:\s|^)(!?)year:(\d{4})(?:\s|$)/i
  const filter = { graduationYear: { $nin: [], $in: [] } }
  let matchResult
  // Multiple value filters are allowed, so loop until no more exist
  while ((matchResult = str.match(yearFilter)) != null) {
    if (matchResult[1] === '!') {
      filter.graduationYear.$nin.push(matchResult[2])
    } else {
      filter.graduationYear.$in.push(matchResult[2])
    }
    str = str.replace(yearFilter, '')
  }
  if (filter.graduationYear.$in.length === 0) {
    delete filter.graduationYear.$in
  }

  return { filter, str }
}

/**
 * For administrators, get a specific student's document.
 * If the url query includes `counts` then it will return
 * how many assignments, exams, and blocks the student owns.
 *
 * @param {*} ctx
 */
async function getStudent (ctx) {
  if (!ctx.state.user.admin) {
    return ctx.forbidden('You are not an administrator!')
  }
  const studentID = ctx.params.studentID

  const student = await Student.findById(studentID)
  if (!student) {
    logger.error(
      `Failed to find student ${studentID} for ${ctx.state.user.identifier}`
    )
    return ctx.notFound(`Student ${studentID} not found.`)
  }
  logger.info(`Getting student ${student.rcs_id} for ${ctx.state.user.identifier}`)
  const counts = {}
  if (ctx.query.counts) {
    // Also get stats
    counts.assignments = await Assignment.countDocuments({ _student: studentID })
    counts.exams = await Exam.countDocuments({ _student: studentID })
    counts.blocks = await Block.countDocuments({ _student: studentID })
  }
  ctx.ok({ student, counts })
}

/**
 * Edit a student's properties iff the logged in user is an admin.
 *
 * Request body should be object of updates, e.g.:
 * { graduationYear: 2022, name: { first: 'Foo', last: 'bar' } }
 *
 * @param {Koa context} ctx
 * @returns The updated student
 */
async function editStudent (ctx) {
  if (!ctx.state.user.admin) {
    return ctx.forbidden('You are not an administrator!')
  }
  const studentID = ctx.params.studentID

  const student = await Student.findById(studentID)
  if (!student) {
    logger.error(
      `Failed to find student ${studentID} for admin ${ctx.state.user.identifier}`
    )
    return ctx.notFound(`Student ${studentID} not found.`)
  }

  delete ctx.request.body._id // Cannot change a user's _id!
  delete ctx.request.body.rcs_id // Cannot change a user's rcs_id!
  if (ctx.request.body.admin && ctx.request.body.admin === false && student.admin) {
    return ctx.forbidden('Admins cannot demote other admins!')
  }
  student.set(ctx.request.body)

  try {
    await student.save()
  } catch (e) {
    logger.error(
      `Failed to update student ${studentID} for admin ${
        ctx.state.user.rcs_id
      }: ${e}`
    )
    return ctx.badRequest('There was an error updating the student.')
  }

  ctx.ok({
    updatedStudent: student
  })
}

async function deleteStudent (ctx) {
  if (!ctx.state.user.admin) {
    return ctx.forbidden('You are not an administrator!')
  }
  const studentID = ctx.params.studentID

  if (ctx.state.user.rcs_id !== 'matraf') {
    return ctx.forbidden('Only Frank can delete accounts!')
  }

  const student = await Student.findById(studentID)
  if (!student) {
    logger.error(
      `Failed to find student ${studentID} for admin ${ctx.state.user.identifier}`
    )
    return ctx.notFound(`Student ${studentID} not found.`)
  }

  try {
    await student.remove()
  } catch (e) {
    logger.error(
      `Failed to remove student ${studentID} for admin ${
        ctx.state.user.rcs_id
      }: ${e}`
    )
    return ctx.badRequest('There was an error deleting the student.')
  }

  ctx.ok({
    deletedStudent: student
  })
}

async function getStudentCounts (ctx) {
  const testers = await Student.countDocuments({ accountLocked: false })
  const waitlist = await Student.countDocuments({ accountLocked: true })

  return ctx.ok({ waitlist, testers })
}

async function getLog (ctx) {
  if (!ctx.state.user.admin) {
    return ctx.forbidden('You are not an administrator!')
  }
  const log = (await fs.readFile(
    path.join(__dirname, '..', '..', '..', 'logs', 'combined.log'),
    'utf8'
  ))
    .toString()
    .split('\n')
  ctx.ok({ log })
}

module.exports = {
  loginAs,
  getUser,
  editUser,
  getStudent,
  editStudent,
  deleteStudent,
  getStudents,
  getStudentCounts,
  getLog
}
