const state = {
  onlineUsers: []
};

const getters = {};

const actions = {
  SOCKET_online ({ commit }, online) {
    commit('SET_ONLINE_USERS', online);
  }
};

const mutations = {
  SET_ONLINE_USERS: (state, online) => {
    state.onlineUsers = online;
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
