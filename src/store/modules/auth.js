import axios from '@/api';
import moment from 'moment';

const state = {
  user: {},
  isAuthenticated: false
};
const getters = {
  userSetup: (state, getters, rootState, rootGetters) => {
    if (!state.isAuthenticated) {
      return {
        personal_info: false,
        course_schedule: false,
        unavailability: false,
        integrations: false
      };
    }
    return {
      personal_info: state.user.setup.personal_info,
      course_schedule: state.user.setup.course_schedule.includes(
        rootGetters.currentTerm.code
      ),
      unavailability: state.user.setup.unavailability.includes(
        rootGetters.currentTerm.code
      ),
      integrations: state.user.setup.integrations
    };
  },
  isUserSetup: (state, getters) => {
    for (let check in getters.userSetup) {
      if (!getters.userSetup[check]) return false;
    }
    return true;
  },
  getUnavailabilityAsEvents: (state, getters, rootState, rootGetters) => {
    if (!rootGetters.current_unavailability) return [];
    return rootGetters.current_unavailability.map(p => {
      return {
        id: 'unavailable',
        title: p.title || 'Busy',
        editable: false,
        eventType: 'unavailability',
        color: 'black',
        start: p.start,
        end: p.end,
        dow: p.dow
      };
    });
  },
  getCourseScheduleAsEvents: (state, getters, rootState, rootGetters) => {
    if (!rootGetters.current_schedule_all) return [];
    // Turn periods into this week's schedule...
    const events = rootGetters.current_schedule_all
      .map(c =>
        c.periods.map(p => {
          let start = moment(p.start, 'Hmm', true).format('HH:mm');
          let end = moment(p.end, 'Hmm', true).format('HH:mm');

          return {
            eventType: 'course',
            title: `${c.longname} ${getters.periodType(p.type)}`,
            start,
            end,
            dow: [p.day],
            color: c.color,
            editable: false,
            period: p,
            course: c
          };
        })
      )
      .flat();

    return events;
  }
};

const actions = {
  async GET_USER ({ dispatch }) {
    try {
      const response = await axios.get('/students/user');
      const user = response.data.user;
      await dispatch('SET_USER', user);
    } catch (e) {
      console.log('Not logged in!');
    }
  },
  async SET_USER ({ dispatch, commit }, user) {
    commit('SET_USER', user);
  },
  async UPDATE_COURSE ({ state, commit, rootGetters }, updatedCourse) {
    commit('UPDATE_COURSE', {
      currentTermCode: rootGetters.currentTerm.code,
      updatedCourse
    });

    // call API
    const request = await axios.post('/setup/courses', {
      courses: rootGetters.current_schedule_all
    });

    commit('SET_USER', request.data.updatedUser);
  }
};

const mutations = {
  SET_USER: (state, user) => {
    state.user = user;
    state.isAuthenticated = true;
  },
  UPDATE_COURSE: (state, { currentTermCode, updatedCourse }) => {
    Object.assign(
      state.user.semester_schedules[currentTermCode].find(
        c => c.crn === updatedCourse.crn
      ),
      updatedCourse
    );
  },
  UNSET_USER: state => {
    state.user = {};
    state.isAuthenticated = false;
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
