/**
 * This Vuex module deals with assessments and work blocks.
 * It stores all upcoming assessments (assignments and exams) in its state.
 * It also provides all the getters for getting specific upcoming assignments,
 * work blocks, groups of upcoming assignments, etc.
 * Note that most getters and actions deal with upcoming assessments only because
 * those are kept in state. Past assessments must be grabbed from the API.
 */

import vm from '@/main'
import axios from '@/api'
import moment from 'moment'

const UPCOMING_ASSESSMENTS_DAYS_CUTOFF = 21 // How many days away are "Far future assignments"

const state = {
  upcomingAssessments: []
}

const getters = {
  /**
   * Given an UPCOMING assessment's ID, find it in the state and return it.
   * @returns The found assessment object OR undefined if not found.
   */
  getUpcomingAssessmentById: state => assessmentID =>
    state.upcomingAssessments.find(
      assessment => assessment._id === assessmentID
    ),
  limitedUpcomingAssessments: state => {
    const cutoff = moment().add(UPCOMING_ASSESSMENTS_DAYS_CUTOFF, 'days')
    return state.upcomingAssessments.filter(assessment =>
      moment(assessment.dueDate || assessment.date).isBefore(cutoff)
    )
  },
  farFutureUpcomingAssessments: state => {
    const cutoff = moment().add(UPCOMING_ASSESSMENTS_DAYS_CUTOFF, 'days')
    return state.upcomingAssessments.filter(assessment =>
      moment(assessment.dueDate || assessment.date).isAfter(cutoff)
    )
  },
  groupAssessments: () => (groupBy, assessments) => {
    const grouped = {}
    for (const assessment of assessments) {
      const key =
        groupBy === 'courseCRN'
          ? assessment.courseCRN
          : moment(assessment.dueDate || assessment.date).format('YYYY-MM-DD')
      if (!grouped[key]) grouped[key] = []
      grouped[key].push(assessment)
    }
    return grouped
  },
  incompleteUpcomingAssignments: state =>
    state.upcomingAssessments.filter(
      assessment =>
        assessment.assessmentType === 'assignment' && !assessment.completed
    ),
  mapAssessmentToEvent: (state, getters) => assessment => ({
    eventType: assessment.assessmentType,
    title: assessment.title,
    start: assessment.dueDate || assessment.date,
    allDay: true,
    editable: false,
    className: `assessment-event ${assessment.assessmentType}-event`,
    color: getters.getCourseFromCRN(assessment.courseCRN).color,
    [assessment.assessmentType]: assessment,
    assessment
  }),
  getUpcomingAssessmentsAsEvents: (state, getters) =>
    state.upcomingAssessments.map(getters.mapAssessmentToEvent),
  /**
   * Get all the assessment blocks from all UPCOMING assessments in the state.
   * @returns The array of work block objects
   */
  getAssessmentBlocks: state => {
    return state.upcomingAssessments
      .map(assessment => assessment._blocks)
      .flat()
  },
  getAssessmentBlocksAsEvents: (state, getters, rootState, rootGetters) => {
    const assessmentBlocks = state.upcomingAssessments.map(assessment =>
      assessment._blocks.map(b =>
        rootGetters.mapAssessmentBlockToEvent(assessment.assessmentType, assessment, b)
      )
    )

    return assessmentBlocks.flat()
  }
}

const actions = {
  /**
   * Every hour it grabs upcoming assignments from the API in case
   * somehow they were added by another means or something.
   */
  async AUTO_GET_UPCOMING_WORK ({ dispatch }) {
    await dispatch('GET_UPCOMING_ASSESSMENTS')
    setTimeout(() => {
      dispatch('GET_UPCOMING_ASSESSMENTS')
    }, 1000 * 60 * 60)
  },
  /**
   * Commits an upcoming assessment to the state and also
   * sorts all the upcoming assessments.
   *
   * @param {Object} newAssessment The new assignment object returned from the API call creating it.
   */
  async ADD_UPCOMING_ASSESSMENT ({ commit }, newAssessment) {
    commit('ADD_UPCOMING_ASSESSMENT', newAssessment)
    commit('SORT_UPCOMING_ASSESSMENTS')
  },
  /**
   * Given an assessment's type and ID, grab it from the API and return it.
   *
   * @param {String} assessmentType Either 'assignment' or 'exam'
   * @param {String} assessmentID The ID of the assessment
   * @returns The assessment object
   */
  async GET_ASSESSMENT ({ getters, dispatch }, { assessmentType, assessmentID }) {
    const request = await axios.get(
      `/${assessmentType}s/${assessmentType.charAt(0)}/${assessmentID}`
    )

    return request.data.assessment
  },
  /**
   * Update an assessment (upcoming or not) given its type, ID, and properties/values to update.
   * It properly handles past and upcoming assessments as well as handling moving past assessments
   * to the future and vice versa.
   *
   * @param {String} assessmentID The ID of the assessment to update
   * @param {String} assessmentType Either 'assignment' or 'exam'
   * @param {Object} updates The object specifying the assessment properties and values to update, e.g. { title: 'New Title', ... }
   * @returns {Object} The updated assignment from the API
   */
  async UPDATE_ASSESSMENT (
    { dispatch, getters, commit },
    { assessmentID, assessmentType, updates }
  ) {
    const request = await axios.patch(
      `/${assessmentType}s/${assessmentType.charAt(0)}/${assessmentID}`,
      updates
    )

    const updatedAssessment = request.data.updatedAssessment

    // Check if the assessment is upcoming (therefore update it in the state) or if
    // it was a past assessment but now is upcoming so it should be added to the state.
    if (getters.getUpcomingAssessmentById(updatedAssessment._id)) {
      // Was it moved to the past?
      if (moment(updatedAssessment.date).isBefore(moment().startOf('day'))) {
        commit('REMOVE_UPCOMING_ASSESSMENT', updatedAssessment)
      } else {
        await dispatch('UPDATE_UPCOMING_ASSESSMENT', updatedAssessment)
      }
    } else if (
      moment(updatedAssessment.date).isSameOrAfter(moment().startOf('day'))
    ) {
      await dispatch('ADD_UPCOMING_ASSESSMENT', updatedAssessment)
    }

    return updatedAssessment
  },
  /**
   * Update an UPCOMING assessment in the state and then sort the upcoming assessments
   * as their order might've changed with this new updated assessment.
   *
   * @param {Object} updatedAssessment The update assessment object returned from the API
   */
  async UPDATE_UPCOMING_ASSESSMENT ({ commit }, updatedAssessment) {
    commit('UPDATE_UPCOMING_ASSESSMENT', updatedAssessment)
    commit('SORT_UPCOMING_ASSESSMENTS')
  },
  /**
   * Given an assignment, toggle it's completion status with the API
   * and update the state if its upcoming.
   *
   * @param {Object} assignmentToToggle Assignment to toggle
   * @returns {Object} The toggled assignment
   */
  async TOGGLE_ASSIGNMENT ({ commit, getters }, assignmentToToggle) {
    const request = await axios.post(
      `/assignments/a/${assignmentToToggle._id}/toggle`
    )
    const updatedAssignment = request.data.updatedAssignment

    if (getters.getUpcomingAssessmentById(updatedAssignment._id)) {
      commit('UPDATE_UPCOMING_ASSESSMENT', updatedAssignment)
    }
    return updatedAssignment
  },
  /**
   * Grabs all upcoming assessments from the API by setting the start date to
   * the current date. It then sets the assessments in the state and orders them.
   * It also joins the client to socket.io rooms for all the upcoming assessments
   * so that it receives any updates for them.
   */
  async GET_UPCOMING_ASSESSMENTS ({ commit }) {
    // Grab assignments
    let response = await axios.get('/assignments', {
      params: { start: moment().format('YYYY-MM-DD') }
    })
    const assignments = response.data.assignments

    // Grab exams
    response = await axios.get('/exams', {
      params: { start: moment().format('YYYY-MM-DD') }
    })
    const exams = response.data.exams

    // Tell the server to add us to the proper assessment rooms
    vm.$socket.client.emit('join assessment rooms', assignments.map(a => a._id))

    commit('SET_UPCOMING_ASSESSMENTS', assignments.concat(exams))
    commit('SORT_UPCOMING_ASSESSMENTS')
  },
  /**
   * Given and assessment object, delete it using the API and remove it
   * from the state if it was upcoming.
   *
   * @param {*} assessmentToRemove The assessment object to remive
   * @returns {Object} The removed assessment object
   */
  async REMOVE_ASSESSMENT ({ commit }, assessmentToRemove) {
    const request = await axios.delete(
      `${
        assessmentToRemove.assessmentType
      }s/${assessmentToRemove.assessmentType.charAt(0)}/${
        assessmentToRemove._id
      }`
    )

    const removedAssessment = request.data.removedAssessment
    if (getters.getUpcomingAssessmentById(removedAssessment._id)) {
      commit('REMOVE_UPCOMING_ASSESSMENT', removedAssessment)
    }

    return removedAssessment
  },
  async REMOVE_ASSIGNMENT_AND_RECURRING ({ commit }, assessmentToRemove) {
    const request = await axios.delete(
      `${
        assessmentToRemove.assessmentType
      }s/${assessmentToRemove.assessmentType.charAt(0)}/${
        assessmentToRemove._id
      }?removeRecurring=future`
    )
    const removedAssessments = [
      request.data.removedAssessment,
      ...request.data.removedRecurringAssignments
    ]
    for (const assessment of removedAssessments) {
      if (getters.getUpcomingAssessmentById(assessment)) {
        commit('REMOVE_UPCOMING_ASSESSMENT', assessment)
      }
    }
    return removedAssessments
  },
  async ADD_ASSESSMENT_COMMENT (
    { commit, getters },
    { assessment, newComment }
  ) {
    const request = await axios.post(
      `/${assessment.assessmentType}s/${assessment.assessmentType.charAt(0)}/${
        assessment._id
      }/comments`,
      { comment: newComment }
    )

    if (getters.getUpcomingAssessmentById(assessment._id)) {
      commit('UPDATE_UPCOMING_ASSESSMENT', request.data.updatedAssessment)
    }

    return request.data.updatedAssessment
  },
  async REMOVE_ASSESSMENT_COMMENT (
    { commit, getters },
    { assessment, commentIndex }
  ) {
    const request = await axios.delete(
      `/${assessment.assessmentType}s/${assessment.assessmentType.charAt(0)}/${
        assessment._id
      }/comments/${commentIndex}`
    )

    if (getters.getUpcomingAssessmentById(assessment._id)) {
      commit('UPDATE_UPCOMING_ASSESSMENT', request.data.updatedAssessment)
    }

    return request.data.updatedAssessment
  }
}

const mutations = {
  SET_UPCOMING_ASSESSMENTS: (state, assessments) => {
    state.upcomingAssessments = assessments
  },
  SORT_UPCOMING_ASSESSMENTS: () => {
    state.upcomingAssessments.sort((a, b) => {
      const aDate = a.dueDate || a.date
      const bDate = b.dueDate || b.date

      if (aDate > bDate) {
        return 1
      } else if (aDate < bDate) {
        return -1
      }
      return 0
    })
  },
  ADD_UPCOMING_ASSESSMENT: (state, assignment) => {
    state.upcomingAssessments.push(assignment)
  },
  UPDATE_UPCOMING_ASSESSMENT: (state, updatedAssessment) => {
    Object.assign(
      state.upcomingAssessments.find(
        assessment => assessment._id === updatedAssessment._id
      ),
      updatedAssessment
    )
  },
  REMOVE_UPCOMING_ASSESSMENT: (state, removedAssignment) => {
    state.upcomingAssessments = state.upcomingAssessments.filter(
      assessment => assessment._id !== removedAssignment._id
    )
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
