<template>
  <div class="integrations-setup">
    <div class="tabs is-centered">
      <ul>
        <li><a @click="currentTab = 'SMSSetup'">SMS</a></li>
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

export default {
  name: 'IntegrationsSetup',
  components: { SMSSetup, EmailSetup },
  data () {
    return {
      currentTab: 'SMSSetup',
      discordVerificationCode: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 8)
    };
  }
};
</script>

<style lang="scss" scoped>
</style>
