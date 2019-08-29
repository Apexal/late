export default {
  computed: {
    rin () {
      return this.$store.state.auth.rin
    },
    pin () {
      return this.$store.state.auth.pin
    }
  },
  methods: {
    promptCredentials (onConfirm) {
      if (!this.rin && !this.pin) {
        this.$buefy.dialog.prompt({
          message: 'What is your RPI RIN?',
          inputAttrs: {
            type: 'password',
            minlength: 1,
            maxlength: 20
          },
          onConfirm: rin => {
            this.$buefy.dialog.prompt({
              message: 'What is your RPI RIN?',
              inputAttrs: {
                type: 'password',
                minlength: 1,
                maxlength: 20
              },
              onConfirm: pin => onConfirm(rin, pin)
            })
          }
        })
      } else {
        onConfirm(this.rin, this.pin)
      }
    }
  }
}
