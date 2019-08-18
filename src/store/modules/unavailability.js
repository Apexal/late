import axios from '@/api';

import moment from 'moment';

const state = {
  unavailabilities: []
};

const getters = {
  current_unavailability: state => {
    return state.unavailabilities;
  },
  mapUnavailabilityToEvent: state => unavailability =>
    Object.assign({}, unavailability, {
      id: unavailability._id,
      editable: false,
      eventType: 'unavailability',
      color: 'black'
    }),
  getUnavailabilityAsEvents: (state, getters) => {
    return state.unavailabilities.map(getters.mapUnavailabilityToEvent);
  },
  currentUnavailability: state => {
    return state.unavailabilities.find(un => {
      if (!un.daysOfWeek.includes(moment().day())) return false;
      const start = moment(un.startTime, 'HH:mm', true);
      const end = moment(un.endTime, 'HH:mm', true);
      if (!moment().isBetween(start, end)) return false;
      return true;
    });
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
  async UPDATE_UNAVAILABILITY ({ commit }, { unavailabilityID, updates }) {
    let request = await axios.patch('/unavailabilities/' + unavailabilityID,
      updates);
    commit('UPDATE_UNAVAILABILITY', request.data.updatedUnavailability);

    return request;
  },
  async REMOVE_UNAVAILABILITY ({ commit }, unavailability) {
    let request = await axios.delete('/unavailabilities/' + unavailability.id);
    commit('REMOVE_UNAVAILABILITY', request.data.deletedUnavailability);

    return request;
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
