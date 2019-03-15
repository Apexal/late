import axios from '@/api';

const state = {
  todos: []
};

const getters = {
  todos: state => state.todos.slice()
};

const actions = {
  async ADD_TODO ({ commit }, newTodo) {
    commit('ADD_TODO', newTodo);
    await axios.post('/todos/save', newTodo);
  },
  async GET_TODOS ({ commit }) {
    const response = await axios.get('/todos');
    commit('SET_TODOS', response.data);
  }
};

const mutations = {
  ADD_TODO: (state, todo) => {
    state.todos.push(todo);
  },
  SET_TODOS: (state, todos) => {
    state.todos = todos;
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
