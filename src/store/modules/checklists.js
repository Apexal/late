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
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
