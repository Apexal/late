import vm from '@/main';
import axios from '@/api';
import moment from 'moment';

const UPCOMING_ASSESSMENTS_DAYS_CUTOFF = 14;

const state = {
  upcomingAssessments: []
};

const getters = {
  getUpcomingAssessmentById: state => assessmentID =>
    state.upcomingAssessments.find(
      assessment => assessment._id === assessmentID
    ),
  limitedUpcomingAssessments: (state, getters) => {
    const cutoff = moment().add(UPCOMING_ASSESSMENTS_DAYS_CUTOFF, 'days');
    return state.upcomingAssessments.filter(assessment =>
      moment(assessment.dueDate || assessment.date).isBefore(cutoff)
    );
  },
  farFutureUpcomingAssessments: (state, getters) => {
    const cutoff = moment().add(UPCOMING_ASSESSMENTS_DAYS_CUTOFF, 'days');
    return state.upcomingAssessments.filter(assessment =>
      moment(assessment.dueDate || assessment.date).isAfter(cutoff)
    );
  },
  groupAssessments: (state, getters) => (groupBy, assessments) => {
    const grouped = {};
    for (let assessment of assessments) {
      const key =
        groupBy === 'courseCRN'
          ? assessment.courseCRN
          : moment(assessment.dueDate || assessment.date).format('YYYY-MM-DD');
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(assessment);
    }
    return grouped;
  },
  incompleteUpcomingAssignments: state =>
    state.upcomingAssessments.filter(
      assessment =>
        assessment.assessmentType === 'assignment' && !assessment.completed
    ),
  mapAssessmentToEvent: (state, getters) => assessment => ({
    eventType: assessment.assessmentType,
    title: assessment.title,
    start: assessment.dueDate || assessment.date,
    allDay: true,
    editable: false,
    className: `assessment-event ${assessment.assessmentType}-event`,
    color: getters.getCourseFromCRN(assessment.courseCRN).color,
    [assessment.assessmentType]: assessment,
    assessment
  }),
  getUpcomingAssessmentsAsEvents: (state, getters) =>
    state.upcomingAssessments.map(getters.mapAssessmentToEvent),
  mapWorkBlockToEvent: (state, getters) => (type, assessment, b) => ({
    blockID: b._id,
    block: b,
    eventType: 'work-block',
    assessmentType: type,
    title: assessment.title,
    className: 'work-block-event',
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
  getWorkBlocks: state => {
    return state.upcomingAssessments
      .map(assessment => assessment._blocks)
      .flat();
  },
  getWorkBlocksAsEvents: (state, getters) => {
    const assessmentWorkBlocks = state.upcomingAssessments.map(assessment =>
      assessment._blocks.map(b =>
        getters.mapWorkBlockToEvent(assessment.assessmentType, assessment, b)
      )
    );

    return assessmentWorkBlocks.flat();
  }
};

const actions = {
  async AUTO_GET_UPCOMING_WORK ({ dispatch }) {
    await dispatch('GET_UPCOMING_ASSESSMENTS');
    setTimeout(() => {
      dispatch('GET_UPCOMING_ASSESSMENTS');
    }, 1000 * 60 * 60);
  },
  async ADD_UPCOMING_ASSESSMENT ({ commit }, newAssessment) {
    commit('ADD_UPCOMING_ASSESSMENT', newAssessment);
    commit('SORT_UPCOMING_ASSESSMENTS');
  },
  async GET_ASSESSMENT ({ getters, dispatch }, { assessmentType, assessmentID }) {
    let request = await axios.get(
      `/${assessmentType}s/${assessmentType.charAt(0)}/${assessmentID}`
    );
    const assessment = request.data.assessment;
    if (getters.getUpcomingAssessmentById(assessment._id)) {
      await dispatch('UPDATE_UPCOMING_ASSESSMENT', assessment);
    }

    return assessment;
  },
  async UPDATE_ASSESSMENT (
    { dispatch, getters },
    { assessmentID, assessmentType, updates }
  ) {
    let request = await axios.patch(
      `/${assessmentType}s/${assessmentType.charAt(0)}/${assessmentID}`,
      updates
    );

    let updatedAssessment = request.data.updatedAssessment;

    if (getters.getUpcomingAssessmentById(updatedAssessment._id)) {
      await dispatch('UPDATE_UPCOMING_ASSESSMENT', updatedAssessment);
    } else if (
      moment(updatedAssessment.date).isSameOrAfter(moment().startOf('day'))
    ) {
      await dispatch('ADD_UPCOMING_ASSESSMENT', updatedAssessment);
    }

    return updatedAssessment;
  },
  async UPDATE_UPCOMING_ASSESSMENT ({ commit }, updatedAssessment) {
    commit('UPDATE_UPCOMING_ASSESSMENT', updatedAssessment);
    commit('SORT_UPCOMING_ASSESSMENTS');
  },
  async TOGGLE_ASSIGNMENT ({ commit, dispatch, getters }, assignmentToToggle) {
    const request = await axios.post(
      `/assignments/a/${assignmentToToggle._id}/toggle`
    );
    const updatedAssignment = request.data.updatedAssignment;

    if (getters.getUpcomingAssessmentById(updatedAssignment._id)) {
      commit('UPDATE_UPCOMING_ASSESSMENT', updatedAssignment);
    }
    return updatedAssignment;
  },
  async GET_UPCOMING_ASSESSMENTS ({ commit }) {
    let response = await axios.get('/assignments', {
      params: { start: moment().format('YYYY-MM-DD') }
    });
    const assignments = response.data.assignments;

    response = await axios.get('/exams', {
      params: { start: moment().format('YYYY-MM-DD') }
    });
    const exams = response.data.exams;

    vm.$socket.emit('join assessment rooms', assignments.map(a => a._id));

    commit('SET_UPCOMING_ASSESSMENTS', assignments.concat(exams));
    commit('SORT_UPCOMING_ASSESSMENTS');
  },
  async REMOVE_ASSESSMENT ({ commit }, assessmentToRemove) {
    const request = await axios.delete(
      `${
        assessmentToRemove.assessmentType
      }s/${assessmentToRemove.assessmentType.charAt(0)}/${
        assessmentToRemove._id
      }`
    );

    const removedAssessment = request.data.removedAssessment;
    if (getters.getUpcomingAssessmentById(removedAssessment._id)) {
      commit('REMOVE_UPCOMING_ASSESSMENT', removedAssessment);
    }

    return removedAssessment;
  },
  async REMOVE_ASSIGNMENT_AND_RECURRING ({ commit }, assessmentToRemove) {
    const request = await axios.delete(
      `${
        assessmentToRemove.assessmentType
      }s/${assessmentToRemove.assessmentType.charAt(0)}/${
        assessmentToRemove._id
      }?removeRecurring=future`
    );
    const removedAssessments = [
      request.data.removedAssessment,
      ...request.data.removedRecurringAssignments
    ];
    for (let assessment of removedAssessments) {
      if (getters.getUpcomingAssessmentById(assessment)) {
        commit('REMOVE_UPCOMING_ASSESSMENT', assessment);
      }
    }
    return removedAssessments;
  },
  async ADD_WORK_BLOCK (
    { commit, getters },
    { assessment, start, end, shared = true }
  ) {
    const request = await axios.post(
      `/blocks/${assessment.assessmentType}/${assessment._id}`,
      { startTime: start, endTime: end, shared }
    );

    if (getters.getUpcomingAssessmentById(assessment._id)) {
      commit('UPDATE_UPCOMING_ASSESSMENT', request.data.updatedAssessment);
    }

    return request.data.updatedAssessment;
  },
  async EDIT_WORK_BLOCK (
    { commit, getters },
    { assessment, blockID, start, end, location }
  ) {
    const updates = {
      startTime: start,
      endTime: end,
      assessmentType: assessment.assessmentType
    };
    if (location) updates.location = location;

    const request = await axios.patch(
      `/blocks/${assessment.assessmentType}/${assessment._id}/${blockID}`,
      updates
    );

    if (getters.getUpcomingAssessmentById(assessment._id)) {
      commit('UPDATE_UPCOMING_ASSESSMENT', request.data.updatedAssessment);
    }

    return request.data.updatedAssessment;
  },
  async REMOVE_WORK_BLOCK ({ commit, getters }, { assessment, blockID }) {
    const request = await axios.delete(
      `/blocks/${assessment.assessmentType}/${assessment._id}/${blockID}`
    );
    if (getters.getUpcomingAssessmentById(assessment._id)) {
      commit('UPDATE_UPCOMING_ASSESSMENT', request.data.updatedAssessment);
    }
    return request.data.updatedAssessment;
  },
  async ADD_ASSESSMENT_COMMENT (
    { commit, getters },
    { assessment, newComment }
  ) {
    let request = await axios.post(
      `/${assessment.assessmentType}s/${assessment.assessmentType.charAt(0)}/${
        assessment._id
      }/comments`,
      { comment: newComment }
    );

    if (getters.getUpcomingAssessmentById(assessment._id)) {
      commit('UPDATE_UPCOMING_ASSESSMENT', request.data.updatedAssessment);
    }

    return request.data.updatedAssessment;
  },
  async REMOVE_ASSESSMENT_COMMENT (
    { commit, getters },
    { assessment, commentIndex }
  ) {
    let request = await axios.delete(
      `/${assessment.assessmentType}s/${assessment.assessmentType.charAt(0)}/${
        assessment._id
      }/comments/${commentIndex}`
    );

    if (getters.getUpcomingAssessmentById(assessment._id)) {
      commit('UPDATE_UPCOMING_ASSESSMENT', request.data.updatedAssessment);
    }

    return request.data.updatedAssessment;
  }
};

const mutations = {
  SET_UPCOMING_ASSESSMENTS: (state, assessments) => {
    state.upcomingAssessments = assessments;
  },
  SORT_UPCOMING_ASSESSMENTS: () => {
    state.upcomingAssessments.sort((a, b) => {
      let aDate = a.dueDate || a.date;
      let bDate = b.dueDate || b.date;

      if (aDate > bDate) {
        return 1;
      } else if (aDate < bDate) {
        return -1;
      }
      return 0;
    });
  },
  ADD_UPCOMING_ASSESSMENT: (state, assignment) => {
    state.upcomingAssessments.push(assignment);
  },
  UPDATE_UPCOMING_ASSESSMENT: (state, updatedAssessment) => {
    Object.assign(
      state.upcomingAssessments.find(
        assessment => assessment._id === updatedAssessment._id
      ),
      updatedAssessment
    );
  },
  REMOVE_UPCOMING_ASSESSMENT: (state, removedAssignment) => {
    state.upcomingAssessments = state.upcomingAssessments.filter(
      assessment => assessment._id !== removedAssignment._id
    );
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
