<template>
  <div class="discord-setup">
    <div
      v-if="verified"
      class="discord-verify"
    >
      <label
        for="discord-id"
        class="label"
      >
        Your Discord ID
      </label>
      <div class="field has-addons">
        <div class="control">
          <input
            id="discord-id"
            class="input"
            type="text"
            :value="discordID"
            disabled
          >
        </div>
        <div class="control">
          <button
            class="button is-danger"
            @click="disable"
          >
            Disable
          </button>
        </div>
      </div>
    </div>
    <div v-else>
      <button
        v-if="!verifying"
        class="button is-warning"
        @click="startVerify"
      >
        Link Discord Account
      </button>
      <div v-else>
        <p>
          Direct message
                 <b>LATE bot</b>
                 <code>.verify {{ verificationCode }}</code> to link your account!
        </p>
        <br>
        <button
          class="button is-info"
          @click="refresh"
        >
          I verified
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SetupIntegrationsDiscord',
  data () {
    return {
      loading: false,
      verifying: false,
      verificationCode: ''
    };
  },
  computed: {
    discordID () {
      return this.$store.state.auth.user.integrations.discord.userID;
    },
    verified () {
      return this.$store.state.auth.user.integrations.discord.verified;
    },
    saved () {
      return (
        JSON.stringify(this.preferences) ===
        JSON.stringify(
          this.$store.state.auth.user.integrations.discord.preferences
        )
      );
    }
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
        request = await this.$http.post(
          '/integrations/discord/preferences',
          this.preferences
        );
      } catch (e) {
        this.loading = false;
        return this.$toasted.error(e.response.data.message);
      }

      await this.$store.dispatch('SET_USER', request.data.updatedUser);
      this.$toasted.success('Successfully updated your Discord preferences!');

      this.loading = false;
    },
    async refresh () {
      await this.$store.dispatch('GET_USER');
    },
    async disable () {
      if (!confirm('Are you sure you want to disable Discord integration?')) {
        return;
      }

      this.loading = true;

      let request;
      try {
        request = await this.$http.delete('/integrations/discord');
      } catch (e) {
        this.loading = false;
        return this.$toasted.error(e.response.data.message);
      }

      await this.$store.dispatch('SET_USER', request.data.updatedUser);
      this.$toasted.success('Successfully disabled Discord integration!');

      this.loading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
