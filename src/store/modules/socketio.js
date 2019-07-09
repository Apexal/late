import io from 'socket.io-client';

const state = {
  socket: null
};

const getters = {};

const actions = {
  SOCKETIO_AUTHENTICATE ({ state, commit, rootState }) {
    commit('SOCKETIO_CONNECT', rootState.auth.user._id);
  }
};

const mutations = {
  SOCKETIO_CONNECT: (state, studentID) => {
    state.socket = io(process.env.BASE_URL);
    state.socket.emit('authentication', studentID);
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
