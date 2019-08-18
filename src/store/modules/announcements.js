/**
 * This Vuex module handles the announcement modal as well as all announcements.
 * It stores all the announcements in its state and provides useful getters
 * and actions to manipulate its state.
 */

import axios from '@/api';

const state = {
  modalOpen: false, // Whether the announcements modal is open
  announcements: [],
  seenIDs: [], // The IDs of announcements that have been seen
  dismissedIDs: [] // The IDs of the announcements that have been manually dismissed by the user
};
const getters = {
  allAnnouncements: state => state.announcements,
  pinnedAnnouncements: state =>
    state.announcements.filter(
      a => !state.dismissedIDs.includes(a._id) && a.isPinned
    )
};
const actions = {
  /**
   * Grabs the announcements from the API and commits them to the state.
   * It also commits to the state the IDs of seen announcements
   * and dismissed announcements by grabbing from localStorage.
   *
   * @returns An array of the announcements
   */
  async GET_ANNOUNCEMENTS ({ commit }) {
    const response = await axios.get('/announcements');
    commit('SET_ANNOUNCEMENTS', response.data.announcements);

    if (localStorage.getItem('seenAnnouncementIDs')) {
      try {
        commit(
          'SET_SEEN_ANNOUNCEMENT_IDS',
          JSON.parse(localStorage.getItem('seenAnnouncementIDs'))
        );
      } catch (e) {
        localStorage.removeItem('seenAnnouncementIDs');
      }
    }
    if (localStorage.getItem('dismissedAnnouncementIDs')) {
      try {
        commit(
          'SET_DISMISSED_ANNOUNCEMENT_IDS',
          JSON.parse(localStorage.getItem('dismissedAnnouncementIDs'))
        );
      } catch (e) {
        localStorage.removeItem('dismissedAnnouncementIDs');
      }
    }

    return response.data.announcements;
  }
};
const mutations = {
  SET_SEEN_ANNOUNCEMENT_IDS: (state, ids) => {
    state.seenIDs = ids;
  },
  SET_DISMISSED_ANNOUNCEMENT_IDS: (state, ids) => {
    state.dismissedIDs = ids;
  },
  SET_ANNOUNCEMENTS_MODEL_OPEN: (state, isOpen) => {
    state.modalOpen = isOpen;
  },
  UPDATE_ANNOUNCEMENT: (state, updatedAnnouncement) => {
    Object.assign(state.announcements.find(ann => ann._id === updatedAnnouncement._id), updatedAnnouncement);
  },
  SET_ANNOUNCEMENTS: (state, announcements) => {
    state.announcements = announcements;
  },
  ADD_ANNOUNCEMENT: (state, announcement) => {
    state.announcements.push(announcement);
    state.announcements = state.announcements.sort((a, b) => {
      if (a.createdAt < b.createdAt) return 1;
      if (a.createdAt > b.createdAt) return -1;
      return 0;
    });
  },
  REMOVE_ANNOUNCEMENT: (state, announcement) => {
    state.announcements = state.announcements.filter(ann => ann._id !== announcement._id);
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
