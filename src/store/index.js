import Vue from 'vue'
import Vuex from 'vuex'
import moment from 'moment'

/* MODULES */
import auth from './modules/auth'
import assessments from './modules/assessments'
import blocks from './modules/blocks'
import schedule from './modules/schedule'
import addAssignmentModal from './modules/addAssignmentModal'
import addExamModal from './modules/addExamModal'
import courseModal from './modules/courseModal'
import todos from './modules/todos'
import unavailability from './modules/unavailability'
import announcements from './modules/announcements'
import studytoolstimer from './modules/studytoolstimer'
import checklists from './modules/checklists'
import SISMan from './modules/sisman'
import tours from './modules/tours'
import socketio from './modules/socketio'
import polls from './modules/polls'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  modules: {
    auth,
    assessments,
    blocks,
    schedule,
    addAssignmentModal,
    addExamModal,
    courseModal,
    todos,
    unavailability,
    announcements,
    studytoolstimer,
    checklists,
    SISMan,
    tours,
    socketio,
    polls
  },
  state: {
    navbarExpanded: false,
    sidebarExpanded: true,
    loaded: false,
    now: new Date()
  },
  getters: {
    todaysAgenda: (state, getters) => {
      if (!getters.userSetup.course_schedule) return []

      const events = getters.todayPeriods
        .filter(p => {
          if (p.type !== 'TES') return true
          // Check if there is a test scheduled this day
          return !!state.assessments.upcomingAssessments.find(
            assessment =>
              assessment.assessmentType === 'exam' &&
              assessment.courseCRN === getters.getCourseFromPeriod(p).crn &&
              moment(assessment.date).isSame(moment(), 'day')
          )
        })
        .map(p => ({
          eventType: 'period',
          course: getters.getCourseFromPeriod(p),
          period: p,
          start: p.startTime,
          end: p.endTime
        }))
        .concat(
          getters.getAssessmentBlocksAsEvents
            .filter(e => moment(e.start).isSame(state.now, 'day'))
            .map(e => ({
              eventType: 'assessment-block',
              block: e.block,
              assessmentType: e.assessmentType,
              assessment: e.assessment,
              course: getters.getCourseFromCRN(e.assessment.courseCRN),
              start: moment(e.start).toDate(),
              end: moment(e.end).toDate(),
              link: {
                name: `${e.assessmentType}-overview`,
                params: { [`${e.assessmentType}ID`]: e.assessment._id }
              }
            }))
        )

      // Add work blocks for today

      return events.sort((a, b) => {
        if (a.start > b.start) return 1
        else if (a.start < b.start) return -1
        else return 0
      })
    }
  },
  mutations: {
    UPDATE_NOW: state => (state.now = new Date()),
    TOGGLE_SIDEBAR: state => (state.sidebarExpanded = !state.sidebarExpanded),
    TOGGLE_NAVBAR: state => (state.navbarExpanded = !state.navbarExpanded),
    SET_LOADED: (state, status) => (state.loaded = status)
  },
  actions: {
    AUTO_UPDATE_NOW ({ commit }) {
      setInterval(() => commit('UPDATE_NOW'), 60 * 1000)
    }
  },
  strict: debug
})
