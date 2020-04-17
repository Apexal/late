const Course = require('../courses/courses.model')
const Block = require('./blocks.model')
const Assignment = require('../assignments/assignments.model')
const Exam = require('../exams/exams.model')
const Todo = require('../todos/todos.model')

const logger = require('../../modules/logger')
const google = require('../../modules/google')

/**
 * Add a block to a specific assignment and have the updated
 * assignment returned. The request body should contain the following:
 * - startTime
 * - endTime
 *
 * @param {Koa context} ctx
 * @returns The updated assignment with the new block added
 *
 * POST /
 */
async function addAssessmentBlock (ctx) {
  const { assessmentType, assessmentID } = ctx.params
  const { startTime, endTime, shared } = ctx.request.body

  const newBlock = new Block({
    _student: ctx.state.user._id,
    _assessment: assessmentID,
    startTime,
    endTime,
    blockType: 'assessment',
    shared
  })

  try {
    await newBlock.save()
  } catch (e) {
    logger.error(`Failed to save new block for ${ctx.state.user.identifier}: ${e}`)
    return ctx.badRequest('There was an error scheduling the work block.')
  }

  let assessment
  // Get assessment
  try {
    assessment = await (assessmentType === 'assignment' ? Assignment : Exam)
      .findOne({
        $or: [
          { _student: ctx.state.user._id },
          { shared: true, sharedWith: ctx.state.user.rcs_id }
        ],
        _id: assessmentID
      })
      .populate('_student', '_id rcs_id name graduationYear integrations')
      .populate('comments._student', '_id rcs_id name graduationYear')
      .populate({
        path: '_blocks',
        match: {
          $or: [
            {
              _student: this._id
            },
            {
              shared: true
            }
          ]
        }
      })
  } catch (e) {
    logger.error(
      `Failed to get ${assessmentType} to add new work block for ${
        ctx.state.user.rcs_id
      }: ${e}`
    )
    return ctx.internalServerError(
      `There was an error getting the ${assessmentType}.`
    )
  }

  assessment._blocks.push(newBlock)

  try {
    await assessment.save()
  } catch (e) {
    logger.error(
      `Failed to save ${assessmentType} with new work block for ${
        ctx.state.user.rcs_id
      }: ${e}`
    )
    return ctx.badRequest('There was an error scheduling the work block.')
  }

  logger.info(`Adding work block for ${ctx.state.user.identifier}`)

  // Attempt to create a Google Calendar event for this block
  if (ctx.state.user.integrations.google.calendarID) {
    try {
      await google.actions.createBlockEvent(ctx.state.user, ctx.session.currentTerm.code, assessment, newBlock)
      logger.info(`Created GCal event for work block for ${ctx.state.user.rcs_id}`)
    } catch (e) {
      logger.error(
        `Failed to add GCal event for work block for ${
          ctx.state.user.rcs_id
        }: ${e}`
      )
    }
  }

  return ctx.ok({
    createdBlock: newBlock,
    updatedAssessment: assessment
  })
}

/**
 * Edit a block by changing the start and end times.
 * The request body should contain:
 * - startTime
 * - endTime
 * - assessmentTyoe
 *
 * @param {Koa context} ctx
 * @returns Updated assessment
 *
 * PATCH /:blockID
 */
async function editAssessmentBlock (ctx) {
  const { assessmentType, assessmentID, blockID } = ctx.params
  const { startTime, endTime, location } = ctx.request.body

  const editedBlock = await Block.findOne({
    _id: blockID,
    _student: ctx.state.user._id
  })

  if (!editedBlock) {
    logger.error(`Could not find work block ${blockID} for ${ctx.state.user.identifier} to edit`)
    return ctx.notFound('Couldn\'t find work block to edit!')
  }

  editedBlock.set(ctx.request.body)

  try {
    await editedBlock.save()
  } catch (e) {
    logger.error(
      `Failed to edit work block for ${ctx.state.user.identifier}: ${e}`
    )
    return ctx.badRequest('There was an error updatng the work block.')
  }

  let assessment
  // Get assessment
  try {
    assessment = await (assessmentType === 'assignment' ? Assignment : Exam)
      .findOne({
        $or: [
          { _student: ctx.state.user._id },
          { shared: true, sharedWith: ctx.state.user.rcs_id }
        ],
        _id: assessmentID
      })
      .populate('comments._student', '_id rcs_id name graduationYear')
      .populate('_student', '_id rcs_id name graduationYear integrations')
      .populate({
        path: '_blocks',
        match: {
          $or: [
            {
              _student: this._id
            },
            {
              shared: true
            }
          ]
        }
      })
  } catch (e) {
    logger.error(
      `Failed to get ${assessmentType} for work block edit for ${
        ctx.state.user.rcs_id
      }: ${e}`
    )
    return ctx.internalServerError(
      'There was an error editing the work block.'
    )
  }

  logger.info(`Edited work block for ${ctx.state.user.identifier}`)

  if (ctx.state.user.integrations.google.calendarID) {
    try {
      await google.actions.patchEvent(ctx.state.user, blockID, {
        location,
        start: {
          dateTime: startTime
        },
        end: {
          dateTime: endTime
        }
      })
    } catch (e) {
      logger.error(
        `Failed to patch GCal event for work block for ${
          ctx.state.user.rcs_id
        }: ${e}`
      )
    }
  }

  return ctx.ok({
    updatedAssessment: assessment
  })
}

/**
 * Delete an assessment block given its ID
 * @param {Koa context} ctx
 * @returns Deleted block
 *
 * DELETE /:blockID
 */
async function deleteAssessmentBlock (ctx) {
  const { assessmentType, assessmentID, blockID } = ctx.params

  const removedBlock = await Block.findOne({
    _id: blockID,
    _student: ctx.state.user._id
  })

  if (!removedBlock) {
    logger.error(`Could not find work block ${blockID} to remove for ${ctx.state.user.identifier}`)
    return ctx.notFound('Could not find the work block to delete!')
  }

  removedBlock.remove()

  let assessment
  // Get assessment
  try {
    assessment = await (assessmentType === 'assignment' ? Assignment : Exam)
      .findOne({
        $or: [
          { _student: ctx.state.user._id },
          { shared: true, sharedWith: ctx.state.user.rcs_id }
        ],
        _id: assessmentID
      })
      .populate('_student', '_id rcs_id name graduationYear integrations')
      .populate('comments._student', '_id rcs_id name graduationYear')
      .populate({
        path: '_blocks',
        match: {
          $or: [
            {
              _student: this._id
            },
            {
              shared: true
            }
          ]
        }
      })
    assessment._blocks = assessment._blocks.filter(
      b => b.id !== removedBlock.id
    )

    await assessment.save()
  } catch (e) {
    logger.error(
      `Failed to get ${assessmentType} for work block remove for ${
        ctx.state.user.rcs_id
      }: ${e}`
    )
    return ctx.internalServerError(
      'There was an error removing the work block.'
    )
  }

  logger.info(`Deleted work block for ${ctx.state.user.identifier}`)

  if (ctx.state.user.integrations.google.calendarID) {
    try {
      await google.actions.deleteEvent(ctx.state.user, blockID)
      logger.info(`Deleted GCal event for ${ctx.state.user.identifier}`)
    } catch (e) {
      logger.error(
        `Failed to delete GCal event for work block for ${
          ctx.state.user.rcs_id
        }: ${e}`
      )
    }
  }

  return ctx.ok({
    removeBlock: removedBlock,
    updatedAssessment: assessment
  })
}

async function addCourseBlock (ctx) {
  const { courseID } = ctx.params
  const { startTime, endTime } = ctx.request.body

  // Find course and make sure it belongs to student
  const course = await Course.findOne({
    _student: ctx.state.user._id,
    _id: courseID
  }).populate('_blocks')

  if (!course) return ctx.notFound('Course not found.')

  const createdCourseBlock = new Block({
    blockType: 'course',
    _student: ctx.state.user._id,
    _course: courseID,
    startTime,
    endTime
  })

  try {
    await createdCourseBlock.save()
  } catch (e) {
    logger.error(`Failed to add course block for ${ctx.state.user.identifier}: ${e}`)
    return ctx.badRequest('Failed to add course block.')
  }

  course._blocks.push(createdCourseBlock)

  await course.save()

  // Attempt to create a Google Calendar event for this block
  if (ctx.state.user.integrations.google.calendarID) {
    try {
      await google.actions.createBlockEvent(ctx.state.user, ctx.session.currentTerm.code, course, createdCourseBlock)
      logger.info(`Created GCal event for course block for ${ctx.state.user.identifier}`)
    } catch (e) {
      logger.error(
        `Failed to add GCal event for course block for ${
          ctx.state.user.rcs_id
        }: ${e}`
      )
    }
  }

  ctx.created({
    updatedCourse: course,
    createdCourseBlock
  })
}

/**
 * Edit a course block by changing the start and end times (and possibly location).
 * The request body should contain:
 * - startTime
 * - endTime
 * - location
 *
 * @param {Koa context} ctx
 * @returns updatedBlock
 * @returns updatedCourse
 *
 * PATCH /course/:blockID
 */
async function editCourseBlock (ctx) {
  const { courseID, blockID } = ctx.params
  const { startTime, endTime, location } = ctx.request.body

  const editedBlock = await Block.findOne({
    blockType: 'course',
    _id: blockID,
    _student: ctx.state.user._id
  })

  if (!editedBlock) {
    logger.error(`Could not find course block ${blockID} for ${ctx.state.user.identifier} to edit`)
    return ctx.notFound('Couldn\'t find course block to edit!')
  }

  editedBlock.set({
    startTime,
    endTime,
    location
  })

  try {
    await editedBlock.save()
  } catch (e) {
    logger.error(
      `Failed to edit course block for ${ctx.state.user.identifier}: ${e}`
    )
    return ctx.badRequest('There was an error updatng the course block.')
  }

  // Get course
  let course
  try {
    course = await Course.findOne({
      _student: ctx.state.user._id,
      _id: courseID
    }).populate('_blocks')
  } catch (e) {
    logger.error(
      `Failed to get course for course block edit for ${
        ctx.state.user.rcs_id
      }: ${e}`
    )
    return ctx.internalServerError(
      'There was an error editing the course block.'
    )
  }

  logger.info(`Edited course block for ${ctx.state.user.identifier}`)

  // Attempt to update Google calendar event
  if (ctx.state.user.integrations.google.calendarID) {
    try {
      await google.actions.patchEvent(ctx.state.user, blockID, {
        location,
        start: {
          dateTime: startTime
        },
        end: {
          dateTime: endTime
        }
      })
      logger.info(`Patched GCal event for course block for ${ctx.state.user.identifier}`)
    } catch (e) {
      logger.error(
        `Failed to patch GCal event for course block for ${
          ctx.state.user.identifier
        }: ${e}`
      )
    }
  }

  return ctx.ok({
    updatedCourse: course,
    updatedBlock: editedBlock
  })
}

/**
 * Delete a course block given its ID
 * @param {Koa context} ctx
 * @returns Deleted block
 *
 * DELETE /course/:courseID/:blockID
 */
async function deleteCourseBlock (ctx) {
  const { courseID, blockID } = ctx.params

  const removedBlock = await Block.findOne({
    blockType: 'course',
    _id: blockID,
    _student: ctx.state.user._id
  })

  if (!removedBlock) {
    logger.error(`Could not find course block ${blockID} to remove for ${ctx.state.user.identifier}`)
    return ctx.notFound('Could not find the course block to delete!')
  }

  removedBlock.remove()

  let course
  // Get assessment
  try {
    course = await Course.findOne({
      _id: courseID,
      _student: ctx.state.user._id
    }).populate('_blocks')
    course._blocks = course._blocks.filter(
      b => b.id !== removedBlock.id
    )

    await course.save()
  } catch (e) {
    logger.error(
      `Failed to get course for course block remove for ${
        ctx.state.user.rcs_id
      }: ${e}`
    )
    return ctx.internalServerError(
      'There was an error removing the course block.'
    )
  }

  logger.info(`Deleted course block for ${ctx.state.user.identifier}`)

  // Attempt to delete GCal event for work block
  if (ctx.state.user.integrations.google.calendarID) {
    try {
      await google.actions.deleteEvent(ctx.state.user, blockID)
      logger.info(`Deleted GCal event for course block for ${ctx.state.user.identifier}`)
    } catch (e) {
      logger.error(
        `Failed to delete GCal event for course block for ${
          ctx.state.user.rcs_id
        }: ${e}`
      )
    }
  }

  return ctx.ok({
    removeBlock: removedBlock,
    updatedCourse: course
  })
}

async function addTodoBlock (ctx) {
  const { todoID } = ctx.params
  const { startTime, endTime } = ctx.request.body

  // Find todo and make sure it belongs to student
  const todo = await Todo.findOne({
    _student: ctx.state.user._id,
    _id: todoID
  }).populate('_blocks')

  if (!todo) return ctx.notFound('Todo not found.')

  const createdTodoBlock = new Block({
    blockType: 'todo',
    _student: ctx.state.user._id,
    _todo: todoID,
    startTime,
    endTime
  })

  try {
    await createdTodoBlock.save()
  } catch (e) {
    logger.error(`Failed to add todo block for ${ctx.state.user.identifier}: ${e}`)
    return ctx.badRequest('Failed to add todo block.')
  }

  todo._blocks.push(createdTodoBlock)
  await todo.save()

  // Attempt to create a Google Calendar event for this block
  if (ctx.state.user.integrations.google.calendarID) {
    try {
      await google.actions.createBlockEvent(ctx.state.user, ctx.session.currentTerm, todo, createdTodoBlock)
      logger.info(`Created GCal event for todo block for ${ctx.state.user.identifier}`)
    } catch (e) {
      logger.error(
        `Failed to add GCal event for todo block for ${
          ctx.state.user.rcs_id
        }: ${e}`
      )
    }
  }

  ctx.created({
    updatedTodo: todo,
    createdTodoBlock
  })
}

/**
 * Edit a todo block by changing the start and end times (and possibly location).
 * The request body should contain:
 * - startTime
 * - endTime
 * - location
 *
 * @param {Koa context} ctx
 * @returns updatedBlock
 * @returns updatedTodo
 *
 * PATCH /todo/:blockID
 */
async function editTodoBlock (ctx) {
  const { todoID, blockID } = ctx.params
  const { startTime, endTime, location } = ctx.request.body

  const editedBlock = await Block.findOne({
    blockType: 'todo',
    _id: blockID,
    _student: ctx.state.user._id
  })

  if (!editedBlock) {
    logger.error(`Could not find todo block ${blockID} for ${ctx.state.user.identifier} to edit`)
    return ctx.notFound('Couldn\'t find todo block to edit!')
  }

  editedBlock.set({
    startTime,
    endTime,
    location
  })

  try {
    await editedBlock.save()
  } catch (e) {
    logger.error(
      `Failed to edit todo block for ${ctx.state.user.identifier}: ${e}`
    )
    return ctx.badRequest('There was an error updatng the todo block.')
  }

  // Get todo
  let todo
  try {
    todo = await Todo.findOne({
      _student: ctx.state.user._id,
      _id: todoID
    }).populate('_blocks')

    if (!todo) throw new Error('Not found')
  } catch (e) {
    logger.error(
      `Failed to get todo for todo block edit for ${
        ctx.state.user.rcs_id
      }: ${e}`
    )
    return ctx.internalServerError(
      'There was an error editing the todo block.'
    )
  }

  logger.info(`Edited todo block for ${ctx.state.user.identifier}`)

  if (ctx.state.user.integrations.google.calendarID) {
    try {
      await google.actions.patchEvent(ctx.state.user, blockID, {
        location,
        start: {
          dateTime: startTime
        },
        end: {
          dateTime: endTime
        }
      })
      logger.info(`Patched GCal event for todo block for ${ctx.state.user.identifier}`)
    } catch (e) {
      logger.error(
        `Failed to patch GCal event for todo block for ${
          ctx.state.user.rcs_id
        }: ${e}`
      )
    }
  }

  return ctx.ok({
    updatedTodo: todo,
    updatedBlock: editedBlock
  })
}

/**
 * Delete a todo block given its ID
 * @param {Koa context} ctx
 * @returns Deleted block
 *
 * DELETE /todo/:todoID/:blockID
 */
async function deleteTodoBlock (ctx) {
  const { todoID, blockID } = ctx.params

  const removedBlock = await Block.findOne({
    blockType: 'todo',
    _id: blockID,
    _student: ctx.state.user._id
  })

  if (!removedBlock) {
    logger.error(`Could not find todo block ${blockID} to remove for ${ctx.state.user.identifier}`)
    return ctx.notFound('Could not find the todo block to delete!')
  }

  removedBlock.remove()

  let todo
  // Get assessment
  try {
    todo = await Todo.findOne({
      _id: todoID,
      _student: ctx.state.user._id
    }).populate('_blocks')
    todo._blocks = todo._blocks.filter(
      b => b.id !== removedBlock.id
    )

    await todo.save()
  } catch (e) {
    logger.error(
      `Failed to get todo for todo block remove for ${
        ctx.state.user.rcs_id
      }: ${e}`
    )
    return ctx.internalServerError(
      'There was an error removing the todo block.'
    )
  }

  logger.info(`Deleted todo block for ${ctx.state.user.identifier}`)

  if (ctx.state.user.integrations.google.calendarID) {
    try {
      await google.actions.deleteEvent(ctx.state.user, blockID)
      logger.info(`Deleted GCal event for ${ctx.state.user.identifier}`)
    } catch (e) {
      logger.error(
        `Failed to delete GCal event for todo block for ${
          ctx.state.user.rcs_id
        }: ${e}`
      )
    }
  }

  return ctx.ok({
    removeBlock: removedBlock,
    updatedTodo: todo
  })
}

module.exports = {
  addAssessmentBlock,
  editAssessmentBlock,
  deleteAssessmentBlock,
  addCourseBlock,
  editCourseBlock,
  deleteCourseBlock,
  addTodoBlock,
  editTodoBlock,
  deleteTodoBlock
}
