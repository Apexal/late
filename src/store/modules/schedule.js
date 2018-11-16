import moment from 'moment';

const state = {
  date: null,
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
  in_class: state => !!state.current.period,
  classes_over: state => {
    if (state.periods.length === 0) return true;

    // Get last end time
    const now = moment();
    const lastEnd = moment(
      now.format('YYYY-MM-DD') +
        ' ' +
        state.periods[state.periods.length - 1].end,
      'YYYY-MM-DD Hmm'
    );
    return now > lastEnd;
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
  AUTO_UPDATE_SCHEDULE ({ dispatch }) {
    setInterval(() => {
      dispatch('UPDATE_SCHEDULE');
    }, 1000 * 60);
  },
  UPDATE_SCHEDULE ({ commit, rootState }) {
    // Reset all state values
    const semesterSchedule = rootState.auth.user.current_schedule;

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
        period: currentPeriod
      },
      periods: dayPeriods
    });
  }
};

const mutations = {
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
