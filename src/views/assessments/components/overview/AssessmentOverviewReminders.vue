<template>
  <div class="assessment-reminders">
    <table class="table is-fullwidth">
      <thead>
        <tr>
          <th>Where</th>
          <th>When</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="reminder in reminders"
          :key="reminder._id"
          class="reminder"
        >
          <td class="reminder-integration">
            {{ reminder.integration }}
          </td>
          <td class="reminder-count">
            {{ reminder.count }} {{ reminder.unit }} before
          </td>
          <td><i class="fas fa-times has-text-danger" /></td>
        </tr>
      </tbody>
    </table>

    <form @submit.prevent="addReminder">
      <b-field>
        <b-select
          v-model="newReminder.integration"
          placeholder="Method of contact"
        >
          <option value="sms">
            SMS
          </option>
          <option value="email">
            Email
          </option>
          <option value="discord">
            Discord
          </option>
        </b-select>

        <b-input
          v-model="newReminder.count"
          name="days"
          type="number"
          min="1"
          :max="countMax"
          value="1"
        />
        <b-select
          v-model="newReminder.unit"
          value="days"
        >
          <option
            value="days"
          >
            Days
          </option>
          <option value="hours">
            Hours
          </option>
        </b-select>
        <button class="button is-dark">
          Add Reminder
        </button>
      </b-field>
    </form>
  </div>
</template>

<script>
export default {
  name: 'AssessmentOverviewReminders',
  props: {
    assessment: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      reminders: [
        {
          integration: 'email',
          count: 7,
          unit: 'days'
        },
        {
          integration: 'sms',
          count: 2,
          unit: 'hours'
        }
      ],
      newReminder: {
        integration: 'email',
        count: 7,
        unit: 'days'
      }
    }
  },
  computed: {
    countMax () {
      return {
        days: 100,
        hours: 23
      }[this.newReminder.unit]
    }
  },
  methods: {
    addReminder () {
      // Check if count fits with unit
      if (this.count > this.countMax) {
        return
      }

      // Push update to server
      this.reminders.push(this.newReminder)
      this.newReminder = {
        integration: 'email',
        count: 7,
        unit: 'days'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.reminder-integration {
  text-transform: capitalize;
}
</style>
