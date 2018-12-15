import axios from '@/api';
import moment from 'moment';

const state = {
  user: {},
  isAuthenticated: false
};
const getters = {
  getUnavailabilityAsEvents: state => {
    if (!state.user.current_unavailability) return [];
    return state.user.current_unavailability.map(p => {
      let start = moment(p.start, 'Hmm', true).format('HH:mm');
      let end = moment(p.end, 'Hmm', true).format('HH:mm');

      return {
        id: 'unavailable',
        title: 'Busy',
        editable: false,
        eventType: 'unavailability',
        start,
        end,
        dow: [p.day],
        isWorkBlock: true
      };
    });
  },
  getCourseScheduleAsEvents: (state, getters) => {
    if (!state.user.current_schedule) return [];
    // Turn periods into this week's schedule...
    const events = state.user.current_schedule
      .map(c =>
        c.periods.map(p => {
          let start = moment(p.start, 'Hmm', true).format('HH:mm');

          let end = moment(p.end, 'Hmm', true).format('HH:mm');

          return {
            id: 'course',
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
    await dispatch('UPDATE_SCHEDULE');
    await dispatch('GET_UPCOMING_ASSIGNMENTS');
  },
  async UPDATE_COURSE ({ state, commit }, updatedCourse) {
    commit('UPDATE_COURSE', updatedCourse);

    // call API
    const request = await axios.post('/setup/courses', {
      courses: state.user.current_schedule
    });

    commit('SET_USER', request.data.updatedUser);
  }
};

const mutations = {
  SET_USER: (state, user) => {
    state.user = user;
    state.isAuthenticated = true;
  },
  UPDATE_COURSE: (state, updatedCourse) => {
    Object.assign(
      state.user.current_schedule.find(c => c.crn === updatedCourse.crn),
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
