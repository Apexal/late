<template>
  <div class="integrations-preferences">
    <h2 class="title">
      Notification Preferences
    </h2>
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
        <div class="control">
          <select
            :id="key"
            v-model="preferences[key]"
            class="input"
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

      <button
        class="button is-primary"
        :class="{ 'is-loading': loading }"
        :disabled="saved"
      >
        Save
      </button>
    </form>
  </div>
</template>

<script>
export default {
  name: 'SetupIntegrationsPreferences',
  filters: {
    capitalize: function (value) {
      if (!value) return '';
      if (value === 'sms') return 'SMS';
      value = value.toString();
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
  },
  data () {
    return {
      loading: false,
      preferences: Object.assign(
        {},
        this.$store.state.auth.user.notificationPreferences
      )
    };
  },
  computed: {
    saved () {
      return (
        JSON.stringify(this.preferences) ===
        JSON.stringify(this.user.notificationPreferences)
      );
    },
    user () {
      return this.$store.state.auth.user;
    },
    possibleIntegrations () {
      return {
        preWorkBlockReminders: ['sms', 'discord'],
        postWorkBlockReminders: ['sms', 'discord'],
        morningReports: ['email', 'discord'],
        addAssignmentReminders: ['sms', 'email', 'discord']
      };
    },
    enabledIntegrations () {
      const enabled = {};
      for (let key in this.possibleIntegrations) {
        enabled[key] = this.possibleIntegrations[key].filter(i => {
          if (i === 'email') return true;
          if (this.user.integrations[i].verified) return true;
          return false;
        });
      }
      return enabled;
    },
    notifications () {
      return {
        preWorkBlockReminders: {
          name: 'Pre Work Block Reminders',
          description: 'Desc here'
        },
        postWorkBlockReminders: {
          name: 'Post Work Block Reminders',
          description: 'Desc here'
        },
        morningReports: {
          name: 'Daily Morning Reports',
          description: 'Desc here'
        },
        addAssignmentReminders: {
          name: 'Add Assignment Reminders',
          description: 'Desc here'
        }
      };
    }
  },
  methods: {
    async save () {
      this.loading = true;

      let request;
      try {
        request = await this.$http.post(
          '/integrations/preferences',
          this.preferences
        );
      } catch (e) {
        this.loading = false;
        return this.$toasted.error(e.response.data.message);
      }

      this.$store.dispatch('SET_USER', request.data.updatedUser);

      this.$toasted.success(
        'Successfully updated your notification preferences!'
      );

      this.loading = false;
    }
  }
};
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
