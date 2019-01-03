<template>
  <div class="integrations-setup">
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
              </a>
            </li>
            <li :class="{ 'is-active': currentTab === 'SetupIntegrationsEmail' }">
              <a @click="setIntegration('email')">
                Email
              </a>
            </li>
            <li :class="{ 'is-active': currentTab === 'SetupIntegrationsDiscord' }">
              <a @click="setIntegration('discord')">
                Discord
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
import SetupIntegrationsPreferences from '@/components/profile/SetupIntegrationsPreferences';
import SetupIntegrationsSMS from '@/components/profile/SetupIntegrationsSMS';
import SetupIntegrationsEmail from '@/components/profile/SetupIntegrationsEmail';
import SetupIntegrationsDiscord from '@/components/profile/SetupIntegrationsDiscord';

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
      discordVerificationCode: Math.random()
        .toString(36)
        .replace(/[^a-z]+/g, '')
        .substr(0, 8),
      map: {
        sms: 'SetupIntegrationsSMS',
        email: 'SetupIntegrationsEmail',
        discord: 'SetupIntegrationsDiscord'
      }
    };
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
</style>
