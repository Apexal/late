import axios from '@/api';

const state = {
  user: null
};
const getters = {
  isAuthenticated: state => !!state.user
};

const actions = {
  async GET_USER({ dispatch, commit }) {
    const response = await axios.get('/students/user');
    const user = response.data.user[0];
    commit('SET_USER', user);
    await dispatch('UPDATE_SCHEDULE');
  }
};

const mutations = {
  SET_USER: (state, user) => {
    state.user = user;
  },
  UNSET_USER: state => {
    state.user = {};
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
