import axios from '@/api';
import moment from 'moment';

const UPCOMING_ASSESSMENTS_DAYS_CUTOFF = 14;

const removedCourse = {
  listing_id: '000',
  section_id: '000',
  longname: 'Removed Course',
  crn: '00000',
  periods: [],
  color: 'grey',
  links: []
};

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
          : moment(assessment.dueDate || assessment.date)
            .startOf('day')
            .toDate();
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
  getCourseFromCRN: (state, getters, rootState, rootGetters) => crn =>
    rootGetters.current_schedule_all.find(c => c.crn === crn) || removedCourse,
  getCourseFromPeriod: (state, getters, rootState, rootGetters) => period =>
    rootGetters.current_schedule_all.find(c =>
      c.periods.find(p => p.day === period.day && p.start === period.start)
    ),
  mapAssessmentToEvent: (state, getters) => assessment => ({
    eventType: assessment.assessmentType,
    title: assessment.title,
    start: assessment.dueDate || assessment.date,
    allDay: true,
    editable: false,
    color: getters.getCourseFromCRN(assessment.courseCRN).color,
    [assessment.assessmentType]: assessment,
    borderColor: assessment.assessmentType === 'exam' ? 'black' : '',
    assessment
  }),
  getUpcomingAssessmentsAsEvents: (state, getters) =>
    state.upcomingAssessments.map(getters.mapAssessmentToEvent),
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
  async UPDATE_UPCOMING_ASSESSMENT ({ commit }, updatedAssessment) {
    commit('UPDATE_UPCOMING_ASSESSMENT', updatedAssessment);
    commit('SORT_UPCOMING_ASSESSMENTS');
  },
  async TOGGLE_UPCOMING_ASSIGNMENT ({ commit }, assignmentID) {
    const request = await axios.post(`/assignments/a/${assignmentID}/toggle`);
    commit('UPDATE_UPCOMING_ASSESSMENT', request.data.updatedAssignment);
    commit('SORT_UPCOMING_ASSESSMENTS');
    return request.data.updatedAssignment;
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

    commit('SET_UPCOMING_ASSESSMENTS', assignments.concat(exams));
    commit('SORT_UPCOMING_ASSESSMENTS');
  },
  async REMOVE_UPCOMING_ASSESSMENT ({ state, commit }, assessmentID) {
    const assessmentToRemove = state.upcomingAssessments.find(
      assessment => assessment._id === assessmentID
    );
    commit('REMOVE_UPCOMING_ASSESSMENT', assessmentID); // It shows up as removed before it actually is ;)
    let apiURL =
      assessmentToRemove.assessmentType === 'assignment'
        ? '/assignments/a/'
        : '/exams/e/';
    const request = await axios.delete(apiURL + assessmentID);
  },
  async ADD_WORK_BLOCK ({ commit, getters }, { assessment, start, end }) {
    const request = await axios.post(
      `/blocks/${assessment.assessmentType}/${assessment._id}`,
      { startTime: start, endTime: end }
    );
    const capitalized =
      assessment.assessmentType === 'assignment' ? 'Assignment' : 'Exam';

    if (getters.getUpcomingAssessmentById(assessment._id)) {
      commit(
        'UPDATE_UPCOMING_ASSESSMENT',
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
      `/blocks/${block.assessment.assessmentType}/${
        block.assessment._id
      }/${blockID}`,
      { startTime: start, endTime: end, assessmentType: block.assessmentType }
    );

    const capitalized =
      block.assessmentType === 'assignment' ? 'Assignment' : 'Exam';

    commit('UPDATE_UPCOMING_ASSESSMENT', request.data['updated' + capitalized]);

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

    if (getters.getUpcomingAssessmentById(block.assessment._id)) {
      commit(
        'UPDATE_UPCOMING_ASSESSMENT',
        request.data['updated' + capitalized]
      );
    }
    return request.data['updated' + capitalized];
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
  REMOVE_UPCOMING_ASSESSMENT: (state, assessmentID) => {
    state.upcomingAssessments = state.upcomingAssessments.filter(
      assessment => assessment._id !== assessmentID
    );
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
