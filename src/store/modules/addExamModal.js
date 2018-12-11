const moment = require('moment');

const state = {
  expanded: false,
  date: moment().add(7, 'days'),
  courseCRN: '00000'
};
const getters = {
  addExamModalDateString: state => state.date.format('YYYY-MM-DD'),
  addExamModalTimeString: state => state.date.format('HH:mm')
};
const mutations = {
  SET_ADD_EXAM_MODAL_DATE: (state, date) => (state.date = date),
  SET_ADD_EXAM_MODAL_COURSE_CRN: (state, courseCRN) =>
    (state.courseCRN = courseCRN),
  TOGGLE_ADD_EXAM_MODAL: state => (state.expanded = !state.expanded)
};

module.exports = {
  state,
  getters,
  mutations
};
