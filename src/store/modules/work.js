import axios from '@/api';

const state = {
  assignments: []
};
const getters = {};
const actions = {
  async GET_UPCOMING_ASSIGNMENTS({ commit }, filter = {}) {
    // Todo, pass filter to url
    const response = await axios.get('/assignments/list');
    const assignments = response.data.assignments;
    commit('SET_ASSIGNMENTS', assignments);
  }
};
const mutations = {
  SET_ASSIGNMENTS: (state, assignments) => {
    state.assignments = assignments;
  },
  ADD_ASSIGNMENT: (state, assignment) => {
    state.assignments.push(assignment);
  },
  REMOVE_ASSIGNMENT: (state, assignmentID) => {
    state.assignments = state.assignments.filter(a => a.id != assignmentID);
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
