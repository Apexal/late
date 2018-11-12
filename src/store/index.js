import Vue from 'vue';
import Vuex from 'vuex';

/* MODULES */
import auth from './modules/auth';
import work from './modules/work';
import schedule from './modules/schedule';
import notifications from './modules/notifications';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
  modules: {
    auth,
    work,
    schedule,
    notifications
  },
  state: {
    navbarExpanded: false,
    sidebarExpanded: true
  },
  mutations: {
    TOGGLE_NAVBAR: state => (state.navbarExpanded = !state.navbarExpanded),
    TOGGLE_SIDEBAR: state => (state.sidebarExpanded = !state.sidebarExpanded)
  },
  strict: debug
});
