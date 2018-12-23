import axios from '@/api';
import moment from 'moment';

const state = {
  date: null,
  terms: [],
  current: {
    course: {},
    period: {}
  },
  next: {
    course: {},
    period: {}
  },
  periods: []
};

const getters = {
  currentTerm: (state, getters, rootState) =>
    state.terms.find(t => moment(rootState.now).isBetween(t.start, t.end)) ||
    {},
  current_schedule: (state, getters, rootState) => {
    if (rootState.auth.isAuthenticated && getters.currentTerm) {
      return rootState.auth.user.semester_schedules[getters.currentTerm.code];
    } else {
      return [];
    }
  },
  nextTerm: state => {
    let tms = state.terms.slice(0);
    return tms.find(t => moment(t.start).isAfter(moment()));
  },
  onBreak: (state, getters) => Object.keys(getters.currentTerm).length === 0,
  inClass: state => !state.current.period,
  classesOver: (state, getters) => {
    return moment().isAfter(getters.currentTerm.classesEnd);
  },
  periodType: () => type =>
    ({
      LEC: 'Lecture',
      LAB: 'Lab',
      TES: 'Test',
      REC: 'Recitation',
      STU: 'Studio'
    }[type] || type)
};

const actions = {
  async GET_TERMS ({ commit }) {
    const response = await axios.get('/terms');
    commit('SET_TERMS', response.data.terms);
  },
  AUTO_UPDATE_SCHEDULE ({ dispatch }) {
    setInterval(() => {
      dispatch('UPDATE_SCHEDULE');
    }, 1000 * 60);
  },
  UPDATE_SCHEDULE ({ commit, getters, rootState }) {
    // Reset all state values
    const semesterSchedule = getters.current_schedule;

    const now = moment(); // moment('1430', 'Hmm');
    const dateStr = now.format('YYYY-MM-DD');
    const day = now.day();

    // Find periods for current day
    let dayPeriods = semesterSchedule
      .map(course => course.periods.filter(p => p.day === day))
      .flat()
      .sort((a, b) => parseInt(a.start) - parseInt(b.start));

    // Check for current class
    const currentPeriod = dayPeriods.find(p => {
      const start = moment(dateStr + ' ' + p.start, 'YYYY-MM-DD Hmm', true);
      const end = moment(dateStr + ' ' + p.end, 'YYYY-MM-DD Hmm', true);

      return start < now && now < end;
    });
    const currentCourse = semesterSchedule.find(c =>
      c.periods.includes(currentPeriod)
    );

    commit('UPDATE_SCHEDULE', {
      datetime: now,
      current: {
        course: currentCourse,
        period: currentPeriod || false
      },
      periods: dayPeriods
    });
  }
};

const mutations = {
  SET_TERMS: (state, terms) => {
    state.terms = terms;
    state.terms.sort((t1, t2) => {
      if (t1.code < t2.code) {
        return -1;
      }
      if (t1.code > t2.code) {
        return 1;
      }
      return 0;
    });
  },
  UPDATE_SCHEDULE: (state, payload) => {
    state.date = payload.datetime.toDate();
    state.periods = payload.periods;
    state.current = payload.current;
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
