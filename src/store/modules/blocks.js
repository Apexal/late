import axios from '@/api'

const state = {}

const getters = {
  mapAssessmentBlockToEvent: (state, getters) => (type, assessment, b) => ({
    blockID: b._id,
    block: b,
    eventType: 'assessment-block',
    assessmentType: type,
    title: (assessment.assessmentType === 'assignment' ? 'Work on ' : 'Study for ') + assessment.title,
    className: 'assessment-block-event',
    color: getters.getCourseFromCRN(assessment.courseCRN).color,
    start: b.startTime,
    end: b.endTime,
    constraint: {
      end: type === 'assignment' ? assessment.dueDate : assessment.date
    },
    assessment,
    [type]: assessment
  }),
  mapCourseBlockToEvent: (state, getters) => (course, b) => ({
    blockID: b._id,
    block: b,
    eventType: 'course-block',
    title: `Study ${course.title}`,
    className: 'course-block-event',
    color: course.color,
    start: b.startTime,
    end: b.endTime,
    constraint: {
      start: course.startDate,
      end: course.endDate
    },
    course
  }),
  mapTodoBlockToEvent: (state, getters) => (todo, b) => ({
    blockID: b._id,
    block: b,
    eventType: 'todo-block',
    title: `${todo.text}`,
    className: 'todo-block-event',
    color: 'blue',
    start: b.startTime,
    end: b.endTime,
    todo
  })
}

const actions = {
  async ADD_ASSESSMENT_BLOCK (
    { commit, getters },
    { assessment, start, end, shared = true }
  ) {
    const request = await axios.post(
      `/blocks/assessment/${assessment.assessmentType}/${assessment._id}`,
      { startTime: start, endTime: end, shared }
    )

    if (getters.getUpcomingAssessmentById(assessment._id)) {
      commit('UPDATE_UPCOMING_ASSESSMENT', request.data.updatedAssessment)
    }

    return request.data.updatedAssessment
  },
  async EDIT_ASSESSMENT_BLOCK (
    { commit, getters },
    { assessment, blockID, start, end, location }
  ) {
    const updates = {
      startTime: start,
      endTime: end,
      assessmentType: assessment.assessmentType
    }
    if (location) updates.location = location

    const request = await axios.patch(
      `/blocks/assessment/${assessment.assessmentType}/${assessment._id}/${blockID}`,
      updates
    )

    if (getters.getUpcomingAssessmentById(assessment._id)) {
      commit('UPDATE_UPCOMING_ASSESSMENT', request.data.updatedAssessment)
    }

    return request.data.updatedAssessment
  },
  async REMOVE_ASSESSMENT_BLOCK ({ commit, getters }, { assessment, blockID }) {
    const request = await axios.delete(
      `/blocks/assessment/${assessment.assessmentType}/${assessment._id}/${blockID}`
    )
    if (getters.getUpcomingAssessmentById(assessment._id)) {
      commit('UPDATE_UPCOMING_ASSESSMENT', request.data.updatedAssessment)
    }
    return request.data.updatedAssessment
  },
  async ADD_COURSE_BLOCK (
    { commit },
    { course, start, end }
  ) {
    const request = await axios.post(
      `/blocks/course/${course._id}`,
      { startTime: start, endTime: end }
    )

    commit('UPDATE_COURSE', request.data.updatedCourse)

    return request.data.updatedCourse
  },
  async EDIT_COURSE_BLOCK (
    { commit, getters },
    { course, blockID, start, end, location }
  ) {
    const updates = {
      startTime: start,
      endTime: end
    }
    if (location) updates.location = location

    const request = await axios.patch(
      `/blocks/course/${course._id}/${blockID}`,
      updates
    )

    commit('UPDATE_COURSE', request.data.updatedCourse)

    return request.data.updatedCourse
  },
  async REMOVE_COURSE_BLOCK ({ commit }, { course, blockID }) {
    const request = await axios.delete(`/blocks/course/${course._id}/${blockID}`)

    commit('UPDATE_COURSE', request.data.updatedCourse)

    return request.data.updatedCourse
  },
  async ADD_TODO_BLOCK (
    { commit },
    { todo, start, end }
  ) {
    const request = await axios.post(
      `/blocks/todo/${todo._id}`,
      { startTime: start, endTime: end }
    )

    commit('UPDATE_TODO', request.data.updatedTodo)

    return request.data.updatedTodo
  },
  async EDIT_TODO_BLOCK (
    { commit },
    { todo, blockID, start, end, location }
  ) {
    const updates = {
      startTime: start,
      endTime: end
    }
    if (location) updates.location = location

    const request = await axios.patch(
      `/blocks/todo/${todo._id}/${blockID}`,
      updates
    )

    commit('UPDATE_TODO', request.data.updatedTodo)

    return request.data.updatedTodo
  },
  async REMOVE_TODO_BLOCK ({ commit }, { todo, blockID }) {
    const request = await axios.delete(`/blocks/todo/${todo._id}/${blockID}`)

    commit('UPDATE_TODO', request.data.updatedTodo)

    return request.data.updatedTodo
  }
}

export default {
  getters,
  actions
}
