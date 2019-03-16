<template>
  <div class="integrations-setup">
    <h2 class="title">
      Notification Preferences
    </h2>
    <div class="columns">
      <div class="column">
        <SetupIntegrationsPreferences />
      </div>
      <div class="column">
        <div class="tabs">
          <ul>
            <li :class="{ 'is-active': currentTab === 'SetupIntegrationsSMS' }">
              <a @click="setIntegration('sms')">
                SMS
                <span class="icon">
                  <i
                    class="fa integration-indicator"
                    :class="integrations.sms.verified ? 'fa-check' : 'fa-times'"
                  />
                </span>
              </a>
            </li>
            <li :class="{ 'is-active': currentTab === 'SetupIntegrationsEmail' }">
              <a @click="setIntegration('email')">
                Email
                <span class="icon">
                  <i class="fa fa-check integration-indicator" />
                </span>
              </a>
            </li>
            <li :class="{ 'is-active': currentTab === 'SetupIntegrationsDiscord' }">
              <a @click="setIntegration('discord')">
                Discord
                <span class="icon">
                  <i
                    class="fa integration-indicator"
                    :class="integrations.discord.verified ? 'fa-check' : 'fa-times'"
                  />
                </span>
              </a>
            </li>
          </ul>
        </div>
        <Component :is="currentTab" />
      </div>
    </div>
  </div>
</template>

<script>
import SetupIntegrationsPreferences from '@/views/components/profile/SetupIntegrationsPreferences';
import SetupIntegrationsSMS from '@/views/components/profile/SetupIntegrationsSMS';
import SetupIntegrationsEmail from '@/views/components/profile/SetupIntegrationsEmail';
import SetupIntegrationsDiscord from '@/views/components/profile/SetupIntegrationsDiscord';

export default {
  name: 'IntegrationsSetup',
  components: {
    SetupIntegrationsPreferences,
    SetupIntegrationsSMS,
    SetupIntegrationsEmail,
    SetupIntegrationsDiscord
  },
  data () {
    return {
      currentTab: 'SetupIntegrationsSMS',
      map: {
        sms: 'SetupIntegrationsSMS',
        email: 'SetupIntegrationsEmail',
        discord: 'SetupIntegrationsDiscord'
      }
    };
  },
  computed: {
    integrations () {
      return this.$store.state.auth.user.integrations;
    }
  },
  created () {
    if (this.$route.hash) {
      this.currentTab = this.map[this.$route.hash.substring(1)] || 'SMSSetup';
    }
  },
  methods: {
    setIntegration (i) {
      this.currentTab = this.map[i];
      location.hash = i;
    }
  }
};
</script>

<style lang="scss" scoped>
.integration-note {
  text-align: center;
  margin: 1.5em 0em 1em 0em;
}

.integration-indicator {
  &.fa-check {
    color: green;
  }
  &.fa-times {
    color: red;
  }
}
</style>
