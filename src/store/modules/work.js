import axios from '@/api';
import moment from 'moment';

const state = {
  assignments: []
};

const getters = {
  getAssigmentsDueOn: state => date => {
    return state.assignments.filter(a => a.dueDate == date);
  },
  getAssigmentsDueBy: state => date => {
    return state.assignments.filter(a => a.dueDate <= date);
  },
  getAssignmentById: state => assignmentID => {
    return state.assignments.find(a => a.id == assignmentID);
  },
  assignmentsGroupedByDueDate: state => {
    const grouped = {};

    for (let a of state.assignments) {
      const day = moment(a.dueDate)
        .startOf('day')
        .toDate();
      if (!grouped[day]) grouped[day] = [];

      grouped[day].push(a);
    }

    return grouped;
  }
};

const actions = {
  async GET_UPCOMING_ASSIGNMENTS({
    commit
  }) {
    const response = await axios.get('/assignments/list');
    const assignments = response.data.assignments;
    commit('SET_ASSIGNMENTS', assignments);
  },
  async ADD_ASSIGNMENT({
    dispatch,
    commit
  }, assignment) {
    commit('ADD_ASSIGNMENT', assignment);
    await dispatch('GET_UPCOMING_ASSIGNMENTS');
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