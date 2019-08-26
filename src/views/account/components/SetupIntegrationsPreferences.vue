<!--Account: Notifications preferences module-->
<template>
  <div class="integrations-preferences">
    <form @submit.prevent="save">
      <div
        v-for="(notification, key) in notifications"
        :key="key"
        class="field"
      >
        <label
          class="label"
          :for="key"
        >
          {{ notification.name }}
          <i
            class="fa notification-indicator"
            :class="preferences[key] ? 'fa-check' : 'fa-times'"
          />
        </label>
        <p class="help">
          {{ notification.description }}
        </p>
        <div class="select">
          <select
            :id="key"
            v-model="preferences[key]"
            class="input"
            :disabled="saved && preferences[key] === 'google calendar'"
          >
            <option
              v-for="integration in enabledIntegrations[key]"
              :key="integration"
              :value="integration"
            >
              {{ integration | capitalize }}
            </option>
            <option value>
              Disabled
            </option>
          </select>
        </div>
      </div>

      <b-button
        type="is-primary"
        :loading="loading"
        :disabled="saved"
        @click="save"
      >
        Set Preferences
      </b-button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'SetupIntegrationsPreferences',
  filters: {
    capitalize: function (value) {
      if (!value) return ''
      if (value === 'sms') return 'SMS'
      value = value.toString()
      return value
        .split(' ')
        .map(s => s.charAt(0).toUpperCase() + s.slice(1))
        .join(' ')
    }
  },
  data () {
    return {
      loading: false,
      preferences: Object.assign(
        {},
        this.$store.state.auth.user.notificationPreferences
      )
    }
  },
  computed: {
    saved () {
      if (!this.$store.getters.userSetup.integrations) return false

      return (
        JSON.stringify(this.preferences) ===
        JSON.stringify(this.user.notificationPreferences)
      )
    },
    enabledIntegrations () {
      const enabled = {}
      for (const key in this.notifications) {
        enabled[key] = this.notifications[key].integrations.filter(i => {
          if (i === 'email') return true
          if (
            !this.user.integrations[i] ||
            this.user.integrations[i].verified
          ) {
            return true
          }
          return false
        })
      }
      return enabled
    },
    notifications () {
      return {
        preWorkBlockReminders: {
          name: 'Remind Before Work Blocks',
          description:
            'Receive reminders 15 minutes before you are schedule to work on an assignment or study for an exam.',
          integrations: ['google calendar', 'sms', 'discord']
        },
        // postWorkBlockReminders: {
        //   name: 'Remind After Work Blocks',
        //   description:
        //     'Enables notifications after completing a scheduled work block.',
        //   integrations: []
        // },
        weeklyReports: {
          name: 'End-of-Week Reports',
          description:
            'Receive a weekly report at the end of the week summarizing your school week comparing it to previous weeks.',
          integrations: ['email']
        },
        examReminder: {
          name: 'Exam Reminder',
          description:
            'Receive a reminder 1 week before an exam to remind you that its coming!',
          integrations: ['email', 'sms', 'discord']
        }
      }
    }
  },
  methods: {
    async save () {
      this.loading = true

      let request
      try {
        request = await this.$http.post(
          '/integrations/preferences',
          this.preferences
        )
      } catch (e) {
        this.loading = false
        return this.$buefy.toast.open({
          message: e.response.data.message,
          type: 'is-danger'
        })
      }

      this.$store.dispatch('SET_USER', request.data.updatedUser)

      this.$buefy.toast.open({
        type: 'is-success',
        message: 'Successfully updated your notification preferences!'
      })

      this.loading = false
    }
  }
}
</script>

<style lang="scss" scoped>
.notification-indicator {
  &.fa-check {
    color: green;
  }
  &.fa-times {
    color: red;
  }
}
</style>
