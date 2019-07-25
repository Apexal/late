import axios from '@/api';
import moment from 'moment';

const removedCourse = {
  section_id: '00',
  originalTitle: 'Removed Course',
  title: 'Removed Course',
  summary: 'REMOVED',
  credits: 0,
  crn: '00000',
  color: 'grey',
  periods: [],
  links: []
};

const state = {
  terms: [],
  courses: []
};

const getters = {
  currentTerm: (state, getters, rootState) =>
    state.terms
      .filter(t => rootState.auth.user.terms.includes(t.code))
      .find(t => moment(rootState.now).isBetween(t.start, t.end)) || {},
  nextTerm: (state, getters, rootState) => {
    return state.terms
      .filter(t => rootState.auth.user.terms.includes(t.code))
      .find(t => moment(t.start).isAfter(moment()));
  },
  ongoingCourses: (state, getters, rootState) => {
    return state.courses.filter(
      course =>
        !course.hidden &&
        moment(rootState.now).isBetween(course.startDate, course.endDate)
    );
  },
  allCourses: state => state.courses.filter(course => !course.hidden),
  getCourseFromCRN: state => crn =>
    state.courses.find(c => c.crn === crn) || removedCourse,
  getCourseFromPeriod: state => period =>
    state.courses.find(c =>
      c.periods.find(p => p.day === period.day && p.start === period.start)
    ),
  todayPeriods: (state, getters) => {
    if (getters.onBreak || getters.classesOver) return [];

    const day = moment().day();
    return getters.ongoingCourses
      .map(course => course.periods.filter(p => p.day === day))
      .flat()
      .sort((a, b) => parseInt(a.start) - parseInt(b.start));
  },
  onBreak: (state, getters) => Object.keys(getters.currentTerm).length === 0,
  classesOver: (state, getters) => moment().isAfter(getters.currentTerm.classesEnd),
  periodType: () => type =>
    ({
      LEC: 'Lecture',
      LAB: 'Lab',
      TES: 'Test',
      REC: 'Recitation',
      STU: 'Studio'
    }[type] || type),
  getCourseScheduleAsEvents: (state, getters, rootState, rootGetters) => {
    // Turn periods into this week's schedule...
    const events = state.courses
      .map(c =>
        c.periods.map(p => {
          let start = moment(p.start, 'Hmm', true).format('HH:mm');
          let end = moment(p.end, 'Hmm', true).format('HH:mm');

          return {
            id: c._id,
            eventType: 'course',
            title: `${c.title} ${getters.periodType(p.type)}`,
            startRecur: c.startDate,
            endRecur: c.endDate,
            startTime: start,
            endTime: end,
            daysOfWeek: [p.day],
            color: c.color,
            editable: false,
            period: p,
            course: c
          };
        })
      )
      .flat();

    return events;
  }
};

const actions = {
  async GET_TERMS ({ commit }) {
    const response = await axios.get('/terms');
    commit('SET_TERMS', response.data.terms);

    return response.data.terms;
  },
  async ADD_TERM ({ commit, state }, newTerm) {
    const response = await axios.post('/terms', newTerm);
    commit('SET_TERMS', [...state.terms, response.data.createdTerm]);

    return response.data.createdTerm;
  },
  async GET_COURSES ({ commit, dispatch }) {
    const response = await axios.get('/courses');
    commit('SET_COURSES', response.data.courses);

    return response.data.courses;
  },
  /**
   * Update a user's course. This updates the single course object passed on the server and validates that no special properties are change (_id, originalTitle, etc.)
   *
   * @param {Object} course The course to update with its new properties and values
   * @returns {Object} The updatedCourse returned from the POST api call
   */
  async UPDATE_COURSE ({ commit }, course) {
    const request = await axios.post(`/courses/${course._id}`, course);
    const updatedCourse = request.data.updatedCourse;
    commit('UPDATE_COURSE', updatedCourse);
    return updatedCourse;
  }
};

const mutations = {
  SET_COURSES: (state, courses) => {
    state.courses = courses;
  },
  UPDATE_COURSE: (state, updatedCourse) => {
    Object.assign(
      state.courses.find(c => c._id === updatedCourse._id),
      updatedCourse
    );
  },
  SET_TERMS: (state, terms) => {
    state.terms = terms;
    state.terms.sort((t1, t2) => {
      if (t1.code < t2.code) {
        return -1;
      }
      if (t1.code > t2.code) {
        return 1;
      }
      return 0;
    });
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
