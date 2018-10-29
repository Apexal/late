import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
  state: {
    user: {
      rcs_id: 'rcs_id',
      _id: 'asd78789324jsdjh94',
      name: {
        first: 'Vyoo',
        last: 'Ecks'
      }
    }
  },
  getters: {
    loggedIn: state => {
      return !!state.user;
    }
  },
  mutations: {},
  actions: {},
  modules: {},
  strict: debug
});
