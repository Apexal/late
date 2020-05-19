<!--Account Setup: Notifications and Integrations-->
<template>
  <div class="integrations-setup">
    <h2 class="is-size-4 integration-note">
      How do you want your updates?
    </h2>
    <div class="columns">
      <div class="column">
        <h2 class="is-size-5">
          Reports
        </h2>
        <hr class="title-divider">
        <SetupReports />
      </div>
      <div class="column">
        <h2 class="is-size-5">
          Integrations
        </h2>
        <hr class="title-divider">
        <div class="tabs">
          <ul>
            <li :class="{'is-active': currentTab === 'SetupIntegrationsSMS'}">
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
            <li :class="{'is-active': currentTab === 'SetupIntegrationsEmail'}">
              <a @click="setIntegration('email')">
                Email
                <span class="icon">
                  <i class="fa fa-check integration-indicator" />
                </span>
              </a>
            </li>
            <li :class="{'is-active': currentTab === 'SetupIntegrationsDiscord'}">
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
            <li :class="{'is-active': currentTab === 'SetupIntegrationsGoogleCalendar'}">
              <a @click="setIntegration('google-calendar')">
                Google Calendar
                <span class="icon">
                  <i
                    class="fa integration-indicator"
                    :class="integrations.google && integrations.google.calendarID ? 'fa-check' : 'fa-times'"
                  />
                </span>
              </a>
            </li>
          </ul>
        </div>
        <Component :is="currentTab" />
      </div>
    </div>
    <hr>
    <router-link
      :to="{name: 'setup-complete'}"
      class="button is-primary is-pulled-right"
    >
      Save and Finish
    </router-link>
  </div>
</template>

<script>
import SetupReports from '@/views/account/components/SetupReports'
import SetupIntegrationsSMS from '@/views/account/components/SetupIntegrationsSMS'
import SetupIntegrationsEmail from '@/views/account/components/SetupIntegrationsEmail'
import SetupIntegrationsDiscord from '@/views/account/components/SetupIntegrationsDiscord'
import SetupIntegrationsGoogleCalendar from '@/views/account/components/SetupIntegrationsGoogleCalendar'

export default {
  name: 'AccountSetupIntegrations',
  components: {
    SetupReports,
    SetupIntegrationsSMS,
    SetupIntegrationsEmail,
    SetupIntegrationsDiscord,
    SetupIntegrationsGoogleCalendar
  },
  data () {
    return {
      currentTab: 'SetupIntegrationsSMS',
      map: {
        sms: 'SetupIntegrationsSMS',
        email: 'SetupIntegrationsEmail',
        discord: 'SetupIntegrationsDiscord',
        'google-calendar': 'SetupIntegrationsGoogleCalendar'
      }
    }
  },
  computed: {
    integrations () {
      return this.$store.state.auth.user.integrations
    }
  },
  created () {
    if (this.$route.hash) {
      this.currentTab = this.map[this.$route.hash.substring(1)] || 'SMSSetup'
    }
  },
  methods: {
    setIntegration (i) {
      this.currentTab = this.map[i]
      location.hash = i
    }
  }
}
</script>

<style lang="scss" scoped>
.title-divider {
  margin: 0.5rem 0;
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
