import axios from '@/api';

const state = {
  todos: []
};

const actions = {
  async ADD_TODO ({ commit }, newTodo) {
    const response = await axios.post('/todos', newTodo);
    commit('ADD_TODO', response.data.createdTodo);
  },
  async GET_TODOS ({ commit }) {
    const response = await axios.get('/todos');
    commit('SET_TODOS', response.data.todos);
  },
  async REMOVE_TODO ({ commit }, todo) {
    commit('REMOVE_TODO', todo);
    await axios.delete('/todos/' + todo._id);
  }
};

const mutations = {
  ADD_TODO: (state, todo) => {
    state.todos.push(todo);
  },
  SET_TODOS: (state, todos) => {
    state.todos = todos;
  },
  REMOVE_TODO: (state, todo) => {
    state.todos = state.todos.splice(state.todos.indexOf(todo), 1);
  }
};

export default {
  state,
  actions,
  mutations
};
