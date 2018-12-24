import Vue from 'vue';
import Vuex from 'vuex';

/* MODULES */
import auth from './modules/auth';
import work from './modules/work';
import schedule from './modules/schedule';
import addAssignmentModal from './modules/addAssignmentModal';
import addExamModal from './modules/addExamModal';
import courseModal from './modules/courseModal';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
  modules: {
    auth,
    work,
    schedule,
    addAssignmentModal,
    addExamModal,
    courseModal
  },
  state: {
    navbarExpanded: false,
    sidebarExpanded: true,
    now: new Date()
  },
  mutations: {
    UPDATE_NOW: state => (state.now = new Date()),
    TOGGLE_NAVBAR: state => (state.navbarExpanded = !state.navbarExpanded),
    TOGGLE_SIDEBAR: state => (state.sidebarExpanded = !state.sidebarExpanded)
  },
  actions: {
    AUTO_UPDATE_NOW ({ commit }) {
      setInterval(() => commit('UPDATE_NOW'), 60 * 1000);
    }
  },
  strict: debug
});
