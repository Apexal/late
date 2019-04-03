const moment = require('moment');

const state = {
  modalStep: 0,
  expanded: false,
  courseCRN: '',
  date: null,
  time: '08:00',
  title: '',
  description: '',
  timeEstimate: 5.0,
  priority: 2
};
const actions = {
  COPY_EXAM_TO_MODAL ({ commit }, exam) {
    commit('SET_ADD_EXAM_MODAL_VALUES', {
      courseCRN: exam.courseCRN,
      date: moment(exam.date),
      time: moment(exam.date).format('HH:mm'),
      title: exam.title,
      description: exam.description,
      timeEstimate: exam.timeEstimate,
      priority: exam.priority
    });
  }
};
const mutations = {
  SET_ADD_EXAM_MODAL_VALUES: (state, updates) => {
    return Object.assign(state, updates);
  },
  TOGGLE_ADD_EXAM_MODAL: state => (state.expanded = !state.expanded)
};

export default {
  state,
  actions,
  mutations
};
