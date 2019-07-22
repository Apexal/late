import axios from '@/api';

const state = {
  user: {},
  isAuthenticated: null
};
const getters = {
  userSetup: (state, getters, rootState, rootGetters) => {
    if (!state.isAuthenticated) {
      return {
        profile: false,
        terms: false,
        course_schedule: false,
        unavailability: false,
        integrations: false,
        google: false
      };
    }
    return {
      profile: state.user.setup.profile,
      terms: state.user.setup.terms,
      course_schedule: state.user.setup.course_schedule.includes(
        rootGetters.currentTerm.code
      ),
      unavailability: state.user.setup.unavailability.includes(
        rootGetters.currentTerm.code
      ),
      integrations: state.user.setup.integrations,
      google: state.user.setup.google
    };
  },
  isUserSetup: (state, getters) => {
    for (let check in getters.userSetup) {
      if (!getters.userSetup[check]) return false;
    }
    return true;
  }
};

const actions = {
  async GET_USER ({ commit, dispatch }) {
    try {
      const response = await axios.get('/students/user');
      const user = response.data.user;
      await dispatch('SET_USER', user);
    } catch (e) {
      // console.log('Not logged in!');
      commit('UNSET_USER');
      commit('SET_LOADED', true);
    }
  },
  async SET_USER ({ commit }, user) {
    commit('SET_USER', user);
  }
};

const mutations = {
  SET_USER: (state, user) => {
    state.user = user;
    state.isAuthenticated = true;
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
