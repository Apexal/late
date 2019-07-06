<!--Start setup page-->

<template>
  <div class="account-home">
    <h1 class="is-size-5 integration-note">
      For
      <b>LATE</b> to function, it must know basic info about yourself, your
      course schedule, your work/study schedule, and (optionally) accounts you
      want to integrate
      <b>LATE</b> with.
    </h1>
    <br>
    <div class="is-flex">
      <router-link
        class="button is-medium is-primary"
        :to="{ name: 'setup-profile' }"
      >
        Manual Setup
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AccountHome',
  data () {
    return {
      loading: false
    };
  },
  methods: {
    promptRIN (onConfirm) {
      this.$dialog.prompt({
        message: 'What is your RPI RIN?',
        inputAttrs: {
          type: 'text',
          minlength: 1,
          maxlength: 20
        },
        onConfirm
      });
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
      });
    },
    startImportFromSIS () {
      this.promptRIN(rin => {
        this.promptPIN(pin => {
          this.importFromSIS(rin, pin);
        });
      });
    },
    async importFromSIS (rin, pin) {
      this.loading = true;

      let request;
      try {
        request = await this.$http.post('/account/sisimport', {
          rin,
          pin
        });
      } catch (e) {
        this.loading = false;
        return this.$toast.open({
          message: e.response.data.message,
          type: 'is-danger'
        });
      }

      await this.$store.dispatch('SET_USER', request.data.updatedUser);
      await this.$store.commit('SET_COURSES', request.data.courses);

      this.$snackbar.open({
        indefinite: true,
        message: 'Successfully grabbed your <b>name, major, graduation year, and courses</b> from SIS! Please review the pages to make sure its accurate.',
        type: 'is-danger',
        position: 'is-bottom',
        actionText: 'Next',
        onAction: () => {
          this.$router.push({ name: 'setup-unavailability' });
        }
      });

      this.loading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.integration-note {
  text-align: center;
  padding: 1.5em 0 1em 0;
  max-width: 1000px;
  margin: 0 auto;
}

/*Centers and resizes button*/
.button {
  margin: 0 auto;
  display: block;
  max-width: 500px;
  height: 3em;
  line-height: 2em;
}
</style>
