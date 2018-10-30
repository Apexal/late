import axios from '@/api';

const state = {
  user: null
};
const getters = {
  isAuthenticated: state => !!state.user
};

const actions = {
  async GET_USER({
    commit
  }) {
    const response = await axios.get('/students/user');
    const user = response.data.user[0];
    //console.log(user);
    commit('SET_USER', user);
  }
};

const mutations = {
  SET_USER: (state, user) => {
    console.log('setting user to:');
    console.log(user);
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