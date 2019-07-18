import tours from '@/modules/tours';

const state = {
  tours,
  modalOpen: false,
  currentTourIndex: -1
};

const getters = {
  seenTours: state => {
    try {
      return JSON.parse(localStorage.getItem('seenTours') || '[]');
    } catch (e) {
      return [];
    }
  },
  getTourFromRoute: state => route =>
    state.tours.find(tour => tour.route && tour.route.name === route.name),
  currentTour: state => state.tours[state.currentTourIndex]
};

const actions = {
  MARK_TOUR_SEEN ({ getters }, tour) {
    localStorage.setItem(
      'seenTours',
      JSON.stringify([...getters.seenTours, tour.title])
    );
  }
};

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
