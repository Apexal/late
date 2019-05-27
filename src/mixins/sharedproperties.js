export default {
  computed: {
    loggedIn () {
      return this.$store.state.auth.isAuthenticated;
    },
    user () {
      return this.$store.state.auth.user;
    },
    onBreak () {
      return this.$store.getters.onBreak;
    },
    courses () {
      return this.$store.getters.current_courses;
    },
    currentTerm () {
      return this.$store.getters.currentTerm;
    }
  }
};
