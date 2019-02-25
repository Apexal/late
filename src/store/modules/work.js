import axios from '@/api';
import moment from 'moment';

const removedCourse = {
  listing_id: '000',
  section_id: '000',
  longname: 'Removed Course',
  crn: '00000',
  periods: [],
  color: 'grey'
};

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
  upcomingAssignmentsGroupedByCourse: state => {
    const grouped = {};

    for (let a of state.upcomingAssignments) {
      if (!grouped[a.courseCRN]) grouped[a.courseCRN] = [];

      grouped[a.courseCRN].push(a);
    }

    return grouped;
  },
  incompleteUpcomingAssignments: state =>
    state.upcomingAssignments.filter(a => !a.completed),
  getCourseFromCRN: (state, getters, rootState, rootGetters) => crn =>
    rootGetters.current_schedule.find(c => c.crn === crn) || removedCourse,
  getCourseFromPeriod: (state, getters, rootState, rootGetters) => period =>
    rootGetters.current_schedule.find(c =>
      c.periods.find(p => p.day === period.day && p.start === period.start)
    ),
  getUpcomingAssigmentsAsEvents: (state, getters) =>
    state.upcomingAssignments.map(a => {
      return {
        eventType: 'assignment',
        title: a.title,
        start: a.dueDate,
        allDay: true,
        editable: false,
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
        editable: false,
        color: getters.getCourseFromCRN(ex.courseCRN).color,
        exam: ex,
        borderColor: 'black'
      };
    }),
  pendingUpcomingExams: state => state.upcomingExams.filter(ex => !ex.passed),
  getUpcomingExamById: state => examID => {
    return state.upcomingExams.find(ex => ex._id === examID);
  },
  mapWorkBlockToEvent: (state, getters) => (type, assessment, b) => ({
    blockID: b._id,
    eventType: 'work-block',
    assessmentType: type,
    title: assessment.title,
    className: 'work-block-event',
    // editable: moment(b.startTime).isAfter(moment()),
    color: 'black',
    borderColor: getters.getCourseFromCRN(assessment.courseCRN).color,
    start: b.startTime,
    end: b.endTime,
    constraint: {
      end: type === 'assignment' ? assessment.dueDate : assessment.date
    },
    assessment,
    [type]: assessment
  }),
  getWorkBlocks: (state, getters) => {
    return state.upcomingAssignments
      .map(a => a._blocks)
      .concat(state.upcomingExams.map(ex => ex._blocks))
      .flat();
  },
  getWorkBlocksAsEvents: (state, getters) => {
    const assignmentWorkBlocks = state.upcomingAssignments.map(a =>
      a._blocks.map(b => getters.mapWorkBlockToEvent('assignment', a, b))
    );
    const examWorkBlocks = state.upcomingExams.map(ex =>
      ex._blocks.map(b => getters.mapWorkBlockToEvent('exam', ex, b))
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
  async ADD_UPCOMING_ASSIGNMENT ({ commit }, newAssignment) {
    commit('ADD_UPCOMING_ASSIGNMENT', newAssignment);
    commit('SORT_UPCOMING_ASSIGNMENTS');
  },
  async UPDATE_UPCOMING_ASSIGNMENT ({ commit }, updatedAssignment) {
    commit('UPDATE_UPCOMING_ASSIGNMENT', updatedAssignment);
    commit('SORT_UPCOMING_ASSIGNMENTS');
  },
  async TOGGLE_UPCOMING_ASSIGNMENT ({ commit }, assignmentID) {
    const request = await axios.post(`/assignments/a/${assignmentID}/toggle`);
    commit('UPDATE_UPCOMING_ASSIGNMENT', request.data.updatedAssignment);
    commit('SORT_UPCOMING_ASSIGNMENTS');
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
  async REMOVE_UPCOMING_EXAM ({ commit }, examID) {
    commit('REMOVE_UPCOMING_EXAM', examID); // It shows up as removed before it actually is ;)
    const request = await axios.delete(`/exams/e/${examID}`);
  },
  async GET_UPCOMING_EXAMS ({ commit }) {
    const response = await axios.get('/exams', {
      params: { start: moment().format('YYYY-MM-DD') }
    });
    const exams = response.data.exams;
    commit('SET_UPCOMING_EXAMS', exams);
  },
  async ADD_WORK_BLOCK (
    { commit, getters },
    { assessmentType, assessment, start, end }
  ) {
    const request = await axios.post(
      `/blocks/${assessmentType}/${assessment._id}`,
      { startTime: start, endTime: end }
    );
    const capitalized = assessmentType === 'assignment' ? 'Assignment' : 'Exam';

    if (getters['getUpcoming' + capitalized + 'ById'](assessment._id)) {
      commit(
        `UPDATE_UPCOMING_${assessmentType.toUpperCase()}`,
        request.data['updated' + capitalized]
      );
    }

    return request.data['updated' + capitalized];
  },
  async EDIT_WORK_BLOCK ({ commit, getters }, { blockID, start, end }) {
    const block = getters.getWorkBlocksAsEvents.find(
      b => b.blockID === blockID
    );
    const request = await axios.patch(
      `/blocks/${block.assessmentType}/${block.assessment._id}/${blockID}`,
      { startTime: start, endTime: end, assessmentType: block.assessmentType }
    );

    const capitalized =
      block.assessmentType === 'assignment' ? 'Assignment' : 'Exam';

    if (getters['getUpcoming' + capitalized + 'ById'](block.assessment._id)) {
      commit(
        `UPDATE_UPCOMING_${block.assessmentType.toUpperCase()}`,
        request.data['updated' + capitalized]
      );
    }

    return request.data['updated' + capitalized];
  },
  async REMOVE_WORK_BLOCK ({ commit, getters }, { blockID }) {
    const block = getters.getWorkBlocksAsEvents.find(
      b => b.blockID === blockID
    );
    const request = await axios.delete(
      `/blocks/${block.assessmentType}/${block.assessment._id}/${blockID}`
    );
    const capitalized =
      block.assessmentType === 'assignment' ? 'Assignment' : 'Exam';

    if (getters['getUpcoming' + capitalized + 'ById'](block.assessment._id)) {
      commit(
        `UPDATE_UPCOMING_${block.assessmentType.toUpperCase()}`,
        request.data['updated' + capitalized]
      );
    }

    return request.data['updated' + capitalized];
  }
};

const mutations = {
  SET_UPCOMING_ASSIGNMENTS: (state, assignments) => {
    state.upcomingAssignments = assignments;
  },
  SORT_UPCOMING_ASSIGNMENTS: () => {
    state.upcomingAssignments.sort((a, b) => {
      if (a.dueDate > b.dueDate) {
        return 1;
      } else if (a.dueDate < b.dueDate) {
        return -1;
      }
      return 0;
    });
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
  },
  UPDATE_UPCOMING_EXAM: (state, updatedExam) => {
    Object.assign(
      state.upcomingExams.find(ex => ex._id === updatedExam._id),
      updatedExam
    );
  },
  REMOVE_UPCOMING_EXAM: (state, examID) => {
    state.upcomingExams = state.upcomingExams.filter(ex => ex._id !== examID);
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
