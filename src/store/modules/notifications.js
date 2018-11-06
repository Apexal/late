const state = {
  list: []
};

const getters = {};

const mutations = {
  ADD_NOTIFICATION: (state, notification) => {
    state.list.push(notification);
  },
  REMOVE_NOTIFICATION: (state, index) => {
    state.list.splice(index, 1);
  }
};

export default {
  state,
  getters,
  mutations
};