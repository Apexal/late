import axios from '@/api';
import moment from 'moment';

const state = {
  user: {},
  isAuthenticated: false
};
const getters = {
  userSetup: (state, getters, rootState, rootGetters) => {
    if (!state.isAuthenticated) {
      return {
        personal_info: false,
        course_schedule: false,
        unavailability: false,
        integrations: false,
        google: false
      };
    }
    return {
      personal_info: state.user.setup.personal_info,
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
  async GET_USER ({ dispatch }) {
    try {
      const response = await axios.get('/students/user');
      const user = response.data.user;
      await dispatch('SET_USER', user);
    } catch (e) {
      console.log('Not logged in!');
    }
  },
  async SET_USER ({ dispatch, commit }, user) {
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
