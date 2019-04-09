import axios from '@/api';

const state = {
  unavailabilities: []
};

const getters = {
  current_unavailability: state => {
    return state.unavailabilities;
  },
  getUnavailabilityAsEvents: state => {
    return state.unavailabilities.map(p =>
      Object.assign({}, p, {
        id: p._id,
        editable: false, // TODO: https://github.com/fullcalendar/fullcalendar/issues/4127
        eventType: 'unavailability',
        color: 'black'
      })
    );
  }
};

const actions = {
  async GET_UNAVAILABILITIES ({ commit }) {
    const response = await axios.get('/unavailabilities');
    commit('SET_UNAVAILABILITIES', response.data.unavailabilities);
    return response;
  },
  async ADD_UNAVAILABILITY ({ commit }, newUnavailability) {
    const response = await axios.post('/unavailabilities', newUnavailability);
    commit('ADD_UNAVAILABILITY', response.data.createdUnavailability);
    return response;
  },
  async UPDATE_UNAVAILABILITY ({ commit }, updatedUnavailability) {
    commit('UPDATE_UNAVAILABILITY', updatedUnavailability);
    return axios.patch(
      '/unavailabilities/' + updatedUnavailability._id,
      updatedUnavailability
    );
  },
  async REMOVE_UNAVAILABILITY ({ commit }, unavailability) {
    commit('REMOVE_UNAVAILABILITY', unavailability);
    return axios.delete('/unavailabilities/' + unavailability._id);
  }
};

const mutations = {
  ADD_UNAVAILABILITY: (state, unavailability) => {
    state.unavailabilities.push(unavailability);
  },
  SET_UNAVAILABILITIES: (state, unavailabilities) => {
    state.unavailabilities = unavailabilities;
  },
  UPDATE_UNAVAILABILITY: (state, updatedUnavailability) => {
    Object.assign(
      state.unavailabilities.find(u => u._id === updatedUnavailability._id),
      updatedUnavailability
    );
  },
  REMOVE_UNAVAILABILITY: (state, unavailability) => {
    state.unavailabilities = state.unavailabilities.filter(
      u => u._id !== unavailability._id
    );
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
