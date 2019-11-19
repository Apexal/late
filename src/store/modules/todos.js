import axios from '@/api'

const state = {
  todos: []
}

const actions = {
  async ADD_TODO ({ commit }, newTodo) {
    const response = await axios.post('/todos', { text: newTodo })
    commit('ADD_TODO', response.data.createdTodo)
  },
  async GET_TODOS ({ commit }) {
    const response = await axios.get('/todos')
    commit('SET_TODOS', response.data.todos)
  },
  async UPDATE_TODO ({ commit }, todo) {
    commit('UPDATE_TODO', todo)
    await axios.post('/todos/' + todo._id, { text: todo.text, completed: todo.completed })
  },
  async REMOVE_TODO ({ commit }, todo) {
    commit('REMOVE_TODO', todo)
    await axios.delete('/todos/' + todo._id)
  }
}
const mutations = {
  ADD_TODO: (state, todo) => {
    state.todos.push(todo)
  },
  SET_TODOS: (state, todos) => {
    state.todos = todos
  },
  UPDATE_TODO: (state, todo) => {
    const index = state.todos.findIndex((t) => t._id === todo._id)
    if (index < 0) {
      return
    }
    state.todos.splice(index, 1, todo)
  },
  REMOVE_TODO: (state, todo) => {
    state.todos = state.todos.filter(t => t._id !== todo._id)
  }
}

export default {
  state,
  actions,
  mutations
}
