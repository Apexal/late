const moment = require('moment');

const state = {
  expanded: false,
  courseCRN: '00000',
  date: null,
  time: '08:00',
  title: '',
  description: '',
  timeEstimate: 5.0,
  priority: 2
};
const actions = {
  COPY_EXAM_TO_MODAL ({ commit }, assignment) {
    commit('SET_ADD_ASSIGNMENT_MODAL_VALUES', {
      courseCRN: assignment.courseCRN,
      date: moment(assignment.date),
      time: moment(assignment.date).format('HH:mm'),
      title: assignment.title,
      description: assignment.description,
      timeEstimate: assignment.timeEstimate,
      priority: assignment.priority
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
