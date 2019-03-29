import axios from '@/api';

const state = {
  announcements: []
};
const getters = {
  allAnnouncements: state => state.announcements,
  pinnedAnnouncements: state => state.announcements.filter(a => a.isPinned)
};
const actions = {
  async GET_ANNOUNCEMENTS ({ commit }) {
    const response = await axios.get('/announcements');
    commit('SET_ANNOUNCEMENTS', response.data.announcements);
  }
};
const mutations = {
  SET_ANNOUNCEMENTS: (state, announcements) => {
    state.announcements = announcements;
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
