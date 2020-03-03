/**
 * This is a global mixing that is added to EVERY component.
 * This means that at any point in time (in a component)
 * you can access the current logger in user, the user's courses,
 * get a course from its CRN, etc.
 *
 * Check out https://vuejs.org/v2/guide/mixins.html for more detail.
 */
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
  },
  methods: {
    getCourseFromCRN (crn) {
      return this.$store.getters.getCourseFromCRN(crn)
    }
  }
}
