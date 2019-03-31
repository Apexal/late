import Vue from 'vue';
import Vuex from 'vuex';
import moment from 'moment';

/* MODULES */
import auth from './modules/auth';
import work from './modules/work';
import schedule from './modules/schedule';
import addAssignmentModal from './modules/addAssignmentModal';
import addExamModal from './modules/addExamModal';
import courseModal from './modules/courseModal';
import todos from './modules/todos';
import unavailability from './modules/unavailability';
import announcements from './modules/announcements';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
  modules: {
    auth,
    work,
    schedule,
    addAssignmentModal,
    addExamModal,
    courseModal,
    todos,
    unavailability
    announcements
  },
  state: {
    navbarExpanded: false,
    sidebarExpanded: true,
    now: new Date()
  },
  getters: {
    todaysAgenda: (state, getters) => {
      if (!getters.userSetup.course_schedule) return [];

      let events = state.schedule.periods
        .filter(p => {
          if (p.type !== 'TES') return true;

          // Check if there is a test scheduled this day
          return !!state.work.upcomingExams.find(
            ex =>
              ex.courseCRN === getters.getCourseFromPeriod(p).crn &&
              moment(ex.date).isSame(moment(), 'day')
          );
        })
        .map(p => ({
          eventType: 'period',
          course: getters.getCourseFromPeriod(p),
          period: p,
          start: moment(p.start, 'Hmm', true),
          end: moment(p.end, 'Hmm', true)
        }))
        .concat(
          getters.getWorkBlocksAsEvents
            .filter(e => moment(e.start).isSame(state.now, 'day'))
            .map(e => ({
              eventType: 'work-block',
              assessmentType: e.assessmentType,
              assessment: e.assessment,
              course: getters.getCourseFromCRN(e.assessment.courseCRN),
              start: moment(e.start),
              end: moment(e.end),
              link: {
                name: `${e.assessmentType}s-overview`,
                params: { [`${e.assessmentType}ID`]: e.assessment._id }
              }
            }))
        );

      // Add work blocks for today

      return events.sort((a, b) => {
        if (a.start > b.start) return 1;
        else if (a.start < b.start) return -1;
        else return 0;
      });
    }
  },
  mutations: {
    UPDATE_NOW: state => (state.now = new Date()),
    TOGGLE_NAVBAR: state => (state.navbarExpanded = !state.navbarExpanded),
    TOGGLE_SIDEBAR: state => (state.sidebarExpanded = !state.sidebarExpanded)
  },
  actions: {
    AUTO_UPDATE_NOW ({ commit }) {
      setInterval(() => commit('UPDATE_NOW'), 60 * 1000);
    }
  },
  strict: debug
});
