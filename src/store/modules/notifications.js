const state = {
  list: []
};

const getters = {};

const actions = {
  async ADD_NOTIFICATION ({ commit }, notification) {
    commit('ADD_NOTIFICATION', notification);
    setTimeout(() => commit('REMOVE_NOTIFICATION', notification), 1000 * 8);
  }
};

const mutations = {
  ADD_NOTIFICATION: (state, notification) => {
    state.list.push(notification);
  },
  REMOVE_NOTIFICATION: (state, notification) => {
    state.list.splice(state.list.indexOf(notification), 1);
  }
};

export default {
  state,
  actions,
  getters,
  mutations
};
