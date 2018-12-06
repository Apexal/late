<template>
  <div class="integrations-setup">
    <h2 class="is-size-5 integration-note">
      <span class="has-text-grey">
        (optional)
      </span> If you would like LATE to notify you of assignments and worktimes, setup one or more integrations below.
    </h2>
    <div class="tabs is-centered">
      <ul>
        <li :class="{ 'is-active': currentTab === 'SMSSetup' }">
          <a @click="setIntegration('sms')">
            SMS
          </a>
        </li>
        <li :class="{ 'is-active': currentTab === 'EmailSetup' }">
          <a @click="setIntegration('email')">
            Email
          </a>
        </li>
        <li :class="{ 'is-active': currentTab === 'DiscordSetup' }">
          <a @click="setIntegration('discord')">
            Discord
          </a>
        </li>
      </ul>
    </div>
    <Component :is="currentTab" />
  </div>
</template>

<script>
import SMSSetup from '@/components/profile/SMSSetup';
import EmailSetup from '@/components/profile/EmailSetup';
import DiscordSetup from '@/components/profile/DiscordSetup';

export default {
  name: 'IntegrationsSetup',
  components: { SMSSetup, EmailSetup, DiscordSetup },
  data () {
    return {
      currentTab: 'SMSSetup',
      discordVerificationCode: Math.random()
        .toString(36)
        .replace(/[^a-z]+/g, '')
        .substr(0, 8),
      map: { 'sms': 'SMSSetup', 'email': 'EmailSetup', 'discord': 'DiscordSetup' }
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
