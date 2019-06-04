const state = {
  checklist: {
    categories: []
  }
};
const getters = {};
const actions = {};
const mutations = {
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
  LOAD_CHECKLIST: state => {
    if (localStorage.getItem('checklist') === null) {
      localStorage.setItem('checklist', JSON.stringify(state.checklist));
    }
    state.checklist = JSON.parse(localStorage.getItem('checklist'));
  },
  SAVE_CHECKLIST: state => {
    localStorage.setItem('checklist', JSON.stringify(state.checklist));
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
