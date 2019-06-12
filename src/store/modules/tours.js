import tours from '@/tours';

const state = {
  tours,
  modalOpen: false,
  currentTourIndex: -1
};

const getters = {
  currentTour: state => state.tours[state.currentTourIndex]
};

const actions = {};

const mutations = {
  TOGGLE_TOURS_MODAL: state => (state.modalOpen = !state.modalOpen),
  SET_TOUR_INDEX: (state, index) => (state.currentTourIndex = index)
};

export default {
  state,
  getters,
  actions,
  mutations
};
