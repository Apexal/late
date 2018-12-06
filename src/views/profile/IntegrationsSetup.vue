<template>
  <div class="integrations-setup">
    <h2 class="is-size-5 integration-note">This step is optional. If you would like LATE to notify you of assignments and worktimes, select an integration below.</h2>
    <div class="tabs is-centered">
      <ul>
        <li :class="{ 'is-active': currentTab === 'SMSSetup' }"><a @click="currentTab = 'SMSSetup'">SMS</a></li>
        <li><a @click="currentTab = 'EmailSetup'">Email</a></li>
        <li><a @click="currentTab = 'DiscordSetup'">Discord</a></li>
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
      discordVerificationCode: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 8)
    };
  }
};
</script>

<style lang="scss" scoped>
.integration-note {
  text-align: center;
  margin: 1.5em 0em 1em 0em;
}
</style>
