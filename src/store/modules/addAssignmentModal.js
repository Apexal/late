const moment = require('moment');

const state = {
  expanded: false,
  courseCRN: '',
  dueDate: moment(),
  dueTime: '08:00',
  title: '',
  description: '',
  timeEstimate: 1.0,
  priority: 3
};
const getters = {};
const actions = {
  COPY_ASSIGNMENT_TO_MODAL ({ commit }, assignment) {
    commit('SET_ADD_ASSIGNMENT_MODAL_VALUES', {
      courseCRN: assignment.courseCRN,
      dueDate: moment(assignment.dueDate),
      dueTime: moment(assignment.dueDate).format('HH:mm'),
      title: assignment.title,
      description: assignment.description,
      timeEstimate: assignment.timeEstimate,
      priority: assignment.priority
    });
  }
};
const mutations = {
  SET_ADD_ASSIGNMENT_MODAL_VALUES: (state, updates) =>
    Object.assign(state, updates),
  TOGGLE_ADD_ASSIGNMENT_MODAL: state => (state.expanded = !state.expanded)
};

export default {
  state,
  getters,
  actions,
  mutations
};
