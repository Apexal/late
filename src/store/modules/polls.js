const state = {
  unvoted: 0
}

const mutations = {
  ADD_POLL: (state) => {
    state.unvoted++
  },
  REMOVE_POLL: (state) => {
    state.unvoted--
  },
  RESET_POLLS: (state) => {
    state.unvoted = 0
  }
}

export default {
  state,
  mutations
}
