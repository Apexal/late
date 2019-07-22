const moment = require('moment');

const state = {
  modalStep: 0, // Current step the modal is displaying
  expanded: false, // Whether the modal is being displayed or not
  courseCRN: '', // The CRN of the chosen course
  dueDate: null, // The chosen due date
  dueTime: '08:00', // The chosen due time in HH:mm format
  title: '', // The chosen title of the assignment
  description: '', // The chosen descriptipn
  timeEstimate: 1.0, // The chosen time estimate in hours
  priority: 3, // The chosen priority of the assignment
  isRecurring: false, // Whether or not the assignment repeats
  recurringDays: [] // The days (0-6) the assignment repeats
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
  RESET_ADD_ASSIGNMENT_MODAL_VALUES: state => {
    Object.assign(state, {
      modalStep: 0,
      courseCRN: '',
      dueDate: null,
      dueTime: '08:00',
      title: '',
      description: '',
      timeEstimate: 1.0,
      priority: 3,
      isRecurring: false,
      recurringDays: []
    });
  },
  TOGGLE_ADD_ASSIGNMENT_MODAL: state => (state.expanded = !state.expanded)
};

export default {
  state,
  actions,
  mutations
};
