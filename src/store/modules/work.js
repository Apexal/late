import axios from '@/api';

const state = {
  assignments: []
};

const getters = {
  getAssigmentsDueOn: state => date => {
    return state.assignments.filter(a => a.dueDate == date);
  },
  getAssigmentsDueBy: state => date => {},
  getAssignmentById: state => assignmentID => {
    return state.assignments.find(a => a.id == assignmentID);
  }
};

const actions = {
  async GET_UPCOMING_ASSIGNMENTS({ commit }) {
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
