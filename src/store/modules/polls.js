const state = {
  unvoted: 0
}

const mutations = {
  ADD_POLL: (state, poll) => {
    state.unvoted++
  }
}

export default {
  state,
  mutations
}
