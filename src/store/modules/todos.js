import axios from '@/api'

const state = {
  todos: []
}
const getters = {
  getTodoBlocks: state => {
    return state.todos
      .map(todo => todo._blocks)
      .flat()
  },
  getTodoBlocksAsEvents: (state, getters, rootState, rootGetters) => {
    const todoBlocks = state.todos.map(todo =>
      todo._blocks.map(b =>
        rootGetters.mapTodoBlockToEvent(todo, b)
      )
    )

    return todoBlocks.flat()
  }
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
    await axios.post('/todos/' + todo._id, todo)
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
    const foundTodo = state.todos.find(t => t.id === todo.id)
    if (foundTodo) Object.assign(foundTodo, todo)
  },
  REMOVE_TODO: (state, todo) => {
    state.todos = state.todos.filter(t => t._id !== todo._id)
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
