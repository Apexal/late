import axios from '@/api';
import moment from 'moment';

const state = {
  assignments: [],
  editingAssignment: false,
  editAssignmentModalExpanded: false,
  assignmentID: ''

};

const getters = {
  getAssigmentsDueOn: state => date => {
    return state.assignments.filter(a => a.dueDate === date);
  },
  getAssigmentsDueBy: state => date => {
    return state.assignments.filter(a => a.dueDate <= date);
  },
  getAssignmentById: state => assignmentID => {
    return state.assignments.find(a => a._id === assignmentID);
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
  },
  getEditState: state => state.editingAssignment,
  getEditAssignmentModalExpanded: state => state.editAssignmentModalExpanded,
  pressingAssignments: state => count =>
    state.assignments.filter(a => !a.completed).slice(0, count),
  getCourseFromCRN: (state, getters, rootState) => crn =>
    rootState.auth.user.current_schedule.find(c => c.crn === crn),
  getCourseFromPeriod: (state, getters, rootState) => period =>
    rootState.auth.user.current_schedule.find(c =>
      c.periods.find(p => p.day === period.day && p.start === period.start)
    )
};

const actions = {
  async GET_UPCOMING_ASSIGNMENTS ({ commit }) {
    const response = await axios.get('/assignments/list');
    const assignments = response.data.assignments;
    commit('SET_ASSIGNMENTS', assignments);
  },
  async ADD_ASSIGNMENT ({ dispatch, commit }, assignment) {
    commit('ADD_ASSIGNMENT', assignment);
    await dispatch('GET_UPCOMING_ASSIGNMENTS');
  },
  async REMOVE_ASSIGNMENT ({ dispatch, commit }, assignmentID) {
    commit('REMOVE_ASSIGNMENT', assignmentID); // It shows up as removed before it actually is ;)
    const request = await axios.post(`/assignments/a/${assignmentID}/remove`);
    await dispatch('GET_UPCOMING_ASSIGNMENTS');
  },
  async TOGGLE_EDIT_ASSIGNMENT_MODAL ({ commit }, assignmentID) {
    commit('TOGGLE_EDIT_ASSIGNMENT_MODAL', assignmentID);
  },
  async EDIT_STATE ({ commit }) {
    commit('EDIT_STATE');
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
    state.assignments = state.assignments.filter(a => a._id !== assignmentID);
  },
  TOGGLE_EDIT_ASSIGNMENT_MODAL: (state, assignmentID) => {
    state.editAssignmentModalExpanded = !state.editAssignmentModalExpanded;
    state.assignmentID = assignmentID;
  },
  EDIT_STATE: (state) => {
    state.editingAssignment = !state.editingAssignment;
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
