import axios from '@/api';
import moment from 'moment';

const state = {
  upcomingAssignments: [],
  upcomingExams: []
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
    }),
  getUpcomingExamsAsEvents: (state, getters) =>
    state.upcomingExams.map(ex => {
      return {
        eventType: 'exam',
        title: ex.title,
        start: ex.date,
        allDay: true,
        color: getters.getCourseFromCRN(ex.courseCRN).color,
        exam: ex,
        borderColor: 'black'
      };
    }),
  getUpcomingExamById: state => examID => {
    return state.upcomingExams.find(ex => ex._id === examID);
  },
  getWorkBlocksAsEvents: (state, getters) => {
    const blockIntoEvent = (type, assessment, b) => ({
      eventType: 'work',
      title: assessment.title,
      color: getters.getCourseFromCRN(assessment.courseCRN).color,
      start: b.startTime,
      end: b.endTime,
      [type]: assessment
    });
    const assignmentWorkBlocks = state.upcomingAssignments.map(a =>
      a._blocks.map(b => blockIntoEvent('assignment', a, b))
    );
    const examWorkBlocks = state.upcomingExams.map(ex =>
      ex._blocks.map(b => blockIntoEvent('exam', ex, b))
    );

    return assignmentWorkBlocks.concat(examWorkBlocks).flat();
  }
};

const actions = {
  async AUTO_GET_UPCOMING_WORK ({ dispatch }) {
    await dispatch('GET_UPCOMING_ASSIGNMENTS');
    await dispatch('GET_UPCOMING_EXAMS');
    setTimeout(() => {
      dispatch('GET_UPCOMING_ASSIGNMENTS');
      dispatch('GET_UPCOMING_EXAMS');
    }, 1000 * 60 * 60);
  },
  async TOGGLE_UPCOMING_ASSIGNMENT ({ commit }, assignmentID) {
    const request = await axios.post(`/assignments/a/${assignmentID}/toggle`);
    commit('UPDATE_UPCOMING_ASSIGNMENT', request.data.updatedAssignment);
    return request.data.updatedAssignment;
  },
  async GET_UPCOMING_ASSIGNMENTS ({ commit }) {
    const response = await axios.get('/assignments', {
      params: { start: moment().format('YYYY-MM-DD') }
    });
    const assignments = response.data.assignments;
    commit('SET_UPCOMING_ASSIGNMENTS', assignments);
  },
  async REMOVE_UPCOMING_ASSIGNMENT ({ commit }, assignmentID) {
    commit('REMOVE_UPCOMING_ASSIGNMENT', assignmentID); // It shows up as removed before it actually is ;)
    const request = await axios.delete(`/assignments/a/${assignmentID}`);
  },
  async GET_UPCOMING_EXAMS ({ commit }) {
    const response = await axios.get('/exams', {
      params: { start: moment().format('YYYY-MM-DD') }
    });
    const exams = response.data.exams;
    commit('SET_UPCOMING_EXAMS', exams);
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
  },
  SET_UPCOMING_EXAMS: (state, exams) => {
    state.upcomingExams = exams;
  },
  ADD_UPCOMING_EXAM: (state, exam) => {
    state.upcomingExams.push(exam);
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
