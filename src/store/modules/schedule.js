const state = {
  date: null,
  in_class: false,
  current_period: null,
  periods: []
};

const actions = {};

const mutations = {
  UPDATE_SCHEDULE: (state, getters, rootState) => {
    // Reset all state values
    const semester_schedule = rootState.auth.user.current_schedule;

    const day = new Date().getDay();

    const day_periods = semester_schedule.filter(p => p.day = day);
    state.periods = day_periods;
    // Find current period
  }
};