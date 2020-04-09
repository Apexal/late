export default {
  methods: {
    /**
     * Show a error (is-danger) toast message.
     *
     * @param {String} message The error message to display
     * @param {Number} duration How many milliseconds to display (default 7000)
     */
    showError (message, duration = 7000) {
      this.$buefy.toast.open({
        message,
        type: 'is-danger',
        duration
      })
    }
  }
}
