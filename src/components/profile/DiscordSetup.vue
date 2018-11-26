<template>
  <div class="discord-setup">
    <h2 class="subtitle">Discord Notifications</h2>

    <div
      v-if="!verified"
      class="box verify"
    >
      <button
        v-if="!verifying"
        class="button is-warning"
        @click="startVerify"
      >Link Discord Account</button>
      <p v-else>Direct message <b>LATE bot</b> <code>.verify {{ verificationCode }}</code> to link your account!</p>
    </div>
    <div
      v-else
      class="preferences"
    >
      <form @submit.prevent="updatePreferences">
        <div class="field">
          <input
            id="enabled"
            v-model="preferences.enabled"
            type="checkbox"
            class="switch"
          >
          <label for="enabled"><b>Enable Discord notifications</b></label>
        </div>
        <div class="field">
          <input
            id="preWorkDM"
            v-model="preferences.preWorkDM"
            type="checkbox"
            class="switch"
          >
          <label for="preWorkDM">DM work session reminder</label>
        </div>
        <div class="field">
          <input
            id="postWorkDM"
            v-model="preferences.postWorkDM"
            type="checkbox"
            class="switch"
          >
          <label for="postWorkDM">DM post-work session checkup</label>
        </div>

        <hr>

        <button
          :class="{ 'is-loading': loading }"
          class="button is-dark"
        >Save</button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DiscordSetup',
  data () {
    return {
      loading: false,
      verifying: false,
      verificationCode: '',
      preferences: Object.assign({}, this.$store.state.auth.user.integrations.discord.preferences)
    };
  },
  computed: {
    verified () { return this.$store.state.auth.user.integrations.discord.verified; }
  },
  methods: {
    async startVerify () {
      let request;
      request = await this.$http.get('/integrations/discord/startverify');

      this.verificationCode = request.data.verificationCode;
      this.verifying = true;
    },
    async updatePreferences () {
      this.loading = true;

      let request;
      try {
        request = await this.$http.post('/integrations/discord/preferences', this.preferences);
      } catch (e) {
        this.loading = false;
        return this.$store.dispatch('ADD_NOTIFICATION', { type: 'success', description: e.response.data.message });
      }

      await this.$store.dispatch('SET_USER', request.data.updatedUser);
      this.$store.dispatch('ADD_NOTIFICATION', { type: 'success', description: 'Successfully updated your Discord preferences!' });

      this.loading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
