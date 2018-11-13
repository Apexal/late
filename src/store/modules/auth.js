import axios from '@/api';
import moment from 'moment';

const state = {
  user: {},
  isAuthenticated: false
};
const getters = {
  getWorkBlocksAsEvents: state =>
    state.user.current_work_schedule.map(p => {
      const sunday = moment().startOf('day');
      while (sunday.day() !== 0) sunday.subtract(1, 'days');
      const sundayStr = sunday.format('YYYY-MM-DD');

      let start = moment(sundayStr + ' ' + p.start, 'YYYY-MM-DD Hmm').add(
        parseInt(p.day),
        'days'
      );
      let end = moment(sundayStr + ' ' + p.end, 'YYYY-MM-DD Hmm').add(
        parseInt(p.day),
        'days'
      );

      return {
        title: 'Work/Study',
        start,
        end,
        isWorkBlock: true
      };
    }),
  getCourseScheduleAsEvents: state => {
    const sunday = moment().startOf('day');
    while (sunday.day() !== 0) sunday.subtract(1, 'days');

    const sundayStr = sunday.format('YYYY-MM-DD');
    // Turn periods into this week's schedule...
    const events = state.user.current_schedule
      .map(c =>
        c.periods.map(p => {
          let start = moment(sundayStr + ' ' + p.start, 'YYYY-MM-DD Hmm').add(
            parseInt(p.day),
            'days'
          );
          let end = moment(sundayStr + ' ' + p.end, 'YYYY-MM-DD Hmm').add(
            parseInt(p.day),
            'days'
          );

          return {
            title: c.longname,
            start: start.toDate(),
            end,
            color: c.color,
            editable: false
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
      console.error('Not logged in!');
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
