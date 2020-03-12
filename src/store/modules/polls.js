import axios from '@/api'

const state = {
  polls: [],
  unvoted: 0
}

const actions = {
  async GET_POLLS ({ commit }, flag) {
    const response = await axios.get('/polls?getAll=' + flag)
    commit('SET_POLLS', response.data.polls)
  }
}

const mutations = {
  SET_POLLS: (state, polls) => {
    state.polls = polls
    state.unvoted = 0
    for (let i = 0; i < polls.length; i++) {
      if (!polls[i].showResults) state.unvoted++
    }
  },
  POLL_VOTE: (state) => {
    state.unvoted--
  }
}

export default {
  state,
  actions,
  mutations
}
