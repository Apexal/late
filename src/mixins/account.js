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
          message: 'What is your <b>RIN</b>?',
          inputAttrs: {
            type: 'password',
            placeholder: 'We do not log or save this ANYWHERE',
            minlength: 1,
            maxlength: 20
          },
          onConfirm: rin => {
            this.$buefy.dialog.prompt({
              message: 'What is your <b>SIS PIN</b>?',
              inputAttrs: {
                type: 'password',
                placeholder: 'We do not log or save this ANYWHERE',
                minlength: 1,
                maxlength: 20
              },
              onConfirm: pin => onConfirm(rin.trim(), pin.trim())
            })
          }
        })
      } else {
        onConfirm(this.rin, this.pin)
      }
    }
  }
}
