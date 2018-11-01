import moment from 'moment';

const state = {
  date: null,
  in_class: false,
  current_period: null,
  periods: []
};

const actions = {
  UPDATE_SCHEDULE({ commit, rootState }) {
    // Reset all state values
    const semester_schedule = rootState.auth.user.current_schedule;

    const now = moment();
    const day = now.day();

    // Find periods for current day
    const day_periods = semester_schedule
      .map(course => course.periods.filter(p => p.day == day))
      .flat();

    // Check for current class
    const current_period = day_periods.find(p => {
      const start = moment(p.start, 'Hmm');
      const end = moment(p.end, 'Hmm');

      return p.start < now && now < end;
    });

    commit('UPDATE_SCHEDULE', {
      datetime: now,
      current_period,
      periods: day_periods
    });
  }
};

const mutations = {
  UPDATE_SCHEDULE: (state, payload) => {
    state.date = payload.datetime.toDate();
    state.periods = payload.periods;
    state.current_period = payload.current_period;
    state.in_class = !!payload.current_period;
  }
};

export default {
  state,
  actions,
  mutations
};
