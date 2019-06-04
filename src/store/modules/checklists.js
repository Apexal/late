import axios from '@/api';

const state = {
  checklist: {
    categories: []
  }
};
const getters = {};

const actions = {
  ADD_CATEGORY ({ commit, dispatch, rootGetters }, categoryTitle) {
    commit('ADD_CATEGORY', categoryTitle);
    dispatch('SAVE_CHECKLIST');
  },
  ADD_CHECKLIST_ITEM ({ commit, dispatch, getters }, payload) {
    commit('ADD_CHECKLIST_ITEM', payload);
    dispatch('SAVE_CHECKLIST');
  },
  UPDATE_CHECKLIST_ITEM ({ commit, dispatch, getters }, payload) {
    commit('UPDATE_CHECKLIST_ITEM', payload);
    dispatch('SAVE_CHECKLIST');
  },
  CLEAR_CHECKLIST ({ commit, dispatch, getters }) {
    commit('CLEAR_CHECKLIST');
    dispatch('SAVE_CHECKLIST');
  },
  async GET_CHECKLIST ({ rootState, commit, getters }) {
    if (rootState.auth.isAuthenticated) {
      const response = await axios.get('/checklists');
      if (response.data.checklist) {
        commit('SET_CHECKLIST', response.data.checklist);
      }
    } else {
      commit('LOAD_LOCAL_CHECKLIST');
    }
  },
  async SAVE_CHECKLIST ({ rootState, getters, commit, dispatch }) {
    if (rootState.auth.isAuthenticated) {
      dispatch('UPDATE_CHECKLIST');
    } else {
      commit('SAVE_LOCAL_CHECKLIST');
    }
  },
  async UPDATE_CHECKLIST ({ state, commit }) {
    const response = await axios.put('/checklists', state.checklist);
  }
};

const mutations = {
  SET_CHECKLIST: (state, checklist) => {
    state.checklist = checklist;
  },
  ADD_CATEGORY: (state, categoryTitle) => {
    state.checklist.categories.push({
      title: categoryTitle,
      items: []
    });
  },
  ADD_CHECKLIST_ITEM: (state, { categoryIndex, item }) => {
    state.checklist.categories[categoryIndex].items.push({
      ...item,
      progress: 0
    });
  },
  UPDATE_CHECKLIST_ITEM: (state, { categoryIndex, itemIndex, updates }) => {
    Object.assign(
      state.checklist.categories[categoryIndex].items[itemIndex],
      updates
    );
  },
  CLEAR_CHECKLIST: state => {
    state.checklist = {
      categories: []
    };
  },
  LOAD_LOCAL_CHECKLIST: state => {
    if (localStorage.getItem('checklist') === null) {
      localStorage.setItem('checklist', JSON.stringify(state.checklist));
    }
    state.checklist = JSON.parse(localStorage.getItem('checklist'));
  },
  SAVE_LOCAL_CHECKLIST: state => {
    localStorage.setItem('checklist', JSON.stringify(state.checklist));
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
