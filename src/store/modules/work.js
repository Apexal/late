import axios from '@/api';
import moment from 'moment';

const state = {
  upcomingAssignments: []
};

const getters = {
  getUpcomingAssigmentsDueOn: state => date => {
    return state.upcomingAssignments.filter(a => a.dueDate === date);
  },
  getUpcomingAssigmentsDueBy: state => date => {
    return state.upcomingAssignments.filter(a => a.dueDate <= date);
  },
  getUpcomingAssignmentById: state => assignmentID => {
    return state.upcomingAssignments.find(a => a._id === assignmentID);
  },
  upcomingAssignmentsGroupedByDueDate: state => {
    const grouped = {};

    for (let a of state.upcomingAssignments) {
      const day = moment(a.dueDate)
        .startOf('day')
        .toDate();

      if (!grouped[day]) grouped[day] = [];

      grouped[day].push(a);
    }

    return grouped;
  },
  incompleteUpcomingAssignments: state =>
    state.upcomingAssignments.filter(a => !a.completed),
  getEditState: state => state.editingAssignment,
  getEditAssignmentModalExpanded: state => state.editAssignmentModalExpanded,
  getCourseFromCRN: (state, getters, rootState) => crn =>
    rootState.auth.user.current_schedule.find(c => c.crn === crn),
  getCourseFromPeriod: (state, getters, rootState) => period =>
    rootState.auth.user.current_schedule.find(c =>
      c.periods.find(p => p.day === period.day && p.start === period.start)
    ),
  getUpcomingAssigmentsAsEvents: (state, getters) =>
    state.upcomingAssignments.map(a => {
      return {
        eventType: 'assignment',
        title: a.title,
        start: a.dueDate,
        allDay: true,
        color: getters.getCourseFromCRN(a.courseCRN).color,
        assignment: a
      };
    })
};

const actions = {
  async AUTO_GET_UPCOMING_ASSIGNMENTS ({ dispatch }) {
    await dispatch('GET_UPCOMING_ASSIGNMENTS');
    setTimeout(() => dispatch('GET_UPCOMING_ASSIGNMENTS'), 1000 * 60 * 60);
  },
  async TOGGLE_UPCOMING_ASSIGNMENT ({ commit }, assignmentID) {
    const request = await axios.post(`/assignments/a/${assignmentID}/toggle`);
    commit('UPDATE_UPCOMING_ASSIGNMENT', request.data.updatedAssignment);
    return request.data.updatedAssignment;
  },
  async GET_UPCOMING_ASSIGNMENTS ({ commit }) {
    const response = await axios.get('/assignments/list', {
      params: { start: moment().format('YYYY-MM-DD') }
    });
    const assignments = response.data.assignments;
    commit('SET_UPCOMING_ASSIGNMENTS', assignments);
  },
  async ADD_UPCOMING_ASSIGNMENT ({ dispatch, commit }, assignment) {
    commit('ADD_UPCOMING_ASSIGNMENT', assignment);
    await dispatch('GET_UPCOMING_ASSIGNMENTS');
  },
  async REMOVE_UPCOMING_ASSIGNMENT ({ commit }, assignmentID) {
    commit('REMOVE_UPCOMING_ASSIGNMENT', assignmentID); // It shows up as removed before it actually is ;)
    const request = await axios.post(`/assignments/a/${assignmentID}/remove`);
  }
};

const mutations = {
  SET_UPCOMING_ASSIGNMENTS: (state, assignments) => {
    state.upcomingAssignments = assignments;
  },
  ADD_UPCOMING_ASSIGNMENT: (state, assignment) => {
    state.upcomingAssignments.push(assignment);
  },
  UPDATE_UPCOMING_ASSIGNMENT: (state, updatedAssignment) => {
    Object.assign(
      state.upcomingAssignments.find(a => a._id === updatedAssignment._id),
      updatedAssignment
    );
  },
  REMOVE_UPCOMING_ASSIGNMENT: (state, assignmentID) => {
    state.upcomingAssignments = state.upcomingAssignments.filter(
      a => a._id !== assignmentID
    );
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
