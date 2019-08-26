const state = {
  current: {},
  open: false
}

const mutations = {
  OPEN_COURSE_MODAL: (state, course) => {
    state.current = course
    state.open = true
  },
  CLOSE_COURSE_MODAL: state => {
    state.open = false
  }
}

export default {
  state,
  mutations
}
