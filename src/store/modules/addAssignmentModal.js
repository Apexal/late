const moment = require('moment');

const state = {
  modalStep: 0,
  expanded: false,
  courseCRN: '',
  dueDate: null,
  dueTime: '08:00',
  title: '',
  description: '',
  timeEstimate: 1.0,
  priority: 3,
  isRecurring: false,
  recurringDays: []
};
const actions = {
  COPY_ASSIGNMENT_TO_MODAL ({ commit }, assignment) {
    commit('SET_ADD_ASSIGNMENT_MODAL_VALUES', {
      courseCRN: assignment.courseCRN,
      dueDate: moment(assignment.dueDate),
      dueTime: moment(assignment.dueDate).format('HH:mm'),
      title: assignment.title,
      description: assignment.description,
      timeEstimate: assignment.timeEstimate,
      priority: assignment.priority,
      recurringDays: [moment(assignment.dueDate).day()]
    });
  }
};
const mutations = {
  SET_ADD_ASSIGNMENT_MODAL_STEP: (state, step) => {
    state.modalStep = step;
  },
  SET_ADD_ASSIGNMENT_MODAL_VALUES: (state, updates) => {
    if ('dueDate' in updates) updates.recurringDays = [updates.dueDate.day()];

    return Object.assign(state, updates);
  },
  TOGGLE_ADD_ASSIGNMENT_MODAL: state => (state.expanded = !state.expanded)
};

export default {
  state,
  actions,
  mutations
};
