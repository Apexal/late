export default {
  computed: {
    loggedIn () {
      return this.$store.state.auth.isAuthenticated
    },
    user () {
      return this.$store.state.auth.user
    },
    onBreak () {
      return this.$store.getters.onBreak
    },
    courses () {
      return this.$store.state.schedule.courses.filter(course => !course.hidden)
    },
    ongoingCourses () {
      return this.$store.getters.ongoingCourses
    },
    currentTerm () {
      return this.$store.getters.currentTerm
    },
    rightNow () {
      return this.$store.state.now
    }
  }
}
