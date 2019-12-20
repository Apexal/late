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
    title: `Work on ${course.title}`,
    className: 'course-block-event',
    color: course.color,
    start: b.startTime,
    end: b.endTime
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

    return request.data.updatedAssessment
  }
}

export default {
  getters,
  actions
}
