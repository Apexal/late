<template>
  <div class="discord-setup">
    <div
      v-if="!verified"
      class="has-text-centered"
    >
      <a
        class="button discord-button is-large"
        href="/auth/discord"
      >
        <img
          src="https://discordapp.com/assets/28174a34e77bb5e5310ced9f95cb480b.png"
          alt=""
        >
        Connect to Discord
      </a>
    </div>
    <div v-else>
      <h2
        v-if="loading"
        class="subtitle has-text-grey has-text-centered"
      >
        Loading your Discord Info...
      </h2>
      <div
        v-else
        class="box is-flex discord-user"
      >
        <img
          :src="discordAvatarURL"
          alt="Your Avatar"
        >
        <b class="is-size-3">{{ discordUser.username }} <span class="has-text-grey">#{{ discordUser.discriminator }}</span></b>
        <div class="right">
          <b-button>
            Disconnect
          </b-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SetupIntegrationsDiscord',
  data () {
    return {
      loading: true,
      discordUser: {
        username: '',
        avatar: '',
        discriminator: '',
        id: ''
      }
    };
  },
  computed: {
    verified () {
      return this.$store.state.auth.user.integrations.discord.verified;
    },
    discordAvatarURL () {
      return `https://cdn.discordapp.com/avatars/${this.discordUser.id}/${this.discordUser.avatar}.png`;
    },
    token () {
      return this.$store.state.auth.user.integrations.discord.tokens.accessToken;
    }
  },
  mounted () {
    this.getDiscordUser();
  },
  methods: {
    async getDiscordUser () {
      this.loading = true;
      let request = await this.$http.get('https://discordapp.com/api/users/@me', {
        headers: {
          Authorization: `Bearer ${this.token}`
        }
      });

      this.discordUser = request.data;
      this.loading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.discord-button  {
  background-color: #7289DA;
  color: white;
  img {
    height: 30px;
    margin-right: 10px;
  }
}
.box.discord-user {
  align-items: center;
  background-color: #2C2F33;
  color: white;
  img {
    height: 75px;
    border-radius: 100%;
    border: 2px solid white;
    background-color: white;
  }
  b {
    margin: 0 20px;
    span {
      margin-left: -5px;
      font-size: 0.7em;
    }
  }

  .right {
    flex: 1;
    text-align: right;
  }

  .button {
    background-color: #7289da;
    border-style: none;
  }

  .button:hover {
    background-color: #677dca;
    color: white;
  }
}
</style>
