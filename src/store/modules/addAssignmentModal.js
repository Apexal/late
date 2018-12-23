const moment = require('moment');

const state = {
  expanded: false,
  dueDate: moment().add(1, 'days'),
  courseCRN: '00000'
};
const getters = {
  addAssignmentModalDueDateString: state => state.dueDate.format('YYYY-MM-DD'),
  addAssignmentModalDueTimeString: state => state.dueDate.format('HH:mm')
};
const mutations = {
  SET_ADD_ASSIGNMENT_MODAL_DUE_DATE: (state, dueDate) =>
    (state.dueDate = dueDate),
  SET_ADD_ASSIGNMENT_MODAL_COURSE_CRN: (state, courseCRN) =>
    (state.courseCRN = courseCRN),
  TOGGLE_ADD_ASSIGNMENT_MODAL: state => (state.expanded = !state.expanded)
};

export default {
  state,
  getters,
  mutations
};
