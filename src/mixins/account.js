export default {
  methods: {
    promptRIN (onConfirm) {
      this.$dialog.prompt({
        message: 'What is your RPI RIN?',
        inputAttrs: {
          type: 'password',
          minlength: 1,
          maxlength: 20
        },
        onConfirm
      })
    },
    promptPIN (onConfirm) {
      this.$dialog.prompt({
        message: 'What is your RPI SIS password?',
        inputAttrs: {
          type: 'password',
          minlength: 1,
          placeholder: 'This is not saved anywhere ever.',
          maxlength: 300
        },
        onConfirm
      })
    }
  }
}
