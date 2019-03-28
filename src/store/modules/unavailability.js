import axios from '@/api';

const state = {
  unavailabilities: []
};

const getters = {
  current_unavailability: (state) => {
    return state.unavailabilities;
  },
  getUnavailabilityAsEvents: (state) => {
    return state.unavailabilities.map(p => {
      return {
        id: 'unavailable',
        title: p.title || 'Busy',
        editable: false,
        eventType: 'unavailability',
        color: 'black',
        start: p.start,
        end: p.end,
        dow: p.dow
      };
    });
  }
};

const actions = {
  async ADD_UNAVAILABILITY ({ commit }, newUnavailability) {
    const response = await axios.post('/unavailabilities', newUnavailability);
    commit('ADD_UNAVAILABILITY', response.data.createdUnavailability);
  },
  async GET_UNAVAILABILITIES ({ commit }) {
    const response = await axios.get('/unavailabilities');
    commit('SET_UNAVAILABILITIES', response.data.unavailabilities);
  },
  async REMOVE_UNAVAILABILITY ({ commit }, unavailability) {
    commit('REMOVE_UNAVAILABILITY', unavailability);
    await axios.delete('/unavailabilities/' + unavailability._id);
  }
};

const mutations = {
  ADD_UNAVAILABILITY: (state, unavailability) => {
    state.unavailabilities.push(unavailability);
  },
  SET_UNAVAILABILITIES: (state, unavailabilities) => {
    state.unavailabilities = unavailabilities;
  },
  REMOVE_UNAVAILABILITY: (state, unavailability) => {
    state.unavailabilities = state.unavailabilities.filter(u => u._id !== unavailability._id);
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
