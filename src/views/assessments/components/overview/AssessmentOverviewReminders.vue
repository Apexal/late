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
          :class="{'has-text-grey': hasPassed(reminder)}"
          class="reminder"
        >
          <td class="reminder-integration">
            {{ reminder.integration }}
          </td>
          <td class="reminder-count">
            {{ reminder.count }} {{ reminder.unit }} before
          </td>
          <td>
            <i
              v-if="!hasPassed(reminder)"
              class="fas fa-times has-text-danger"
              @click="removeReminder(reminder)"
            />
          </td>
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
import moment from 'moment'

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
          _id: '98acbe989',
          integration: 'email',
          count: 7,
          unit: 'days'
        },
        {
          _id: '423jsajdj34s',
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
    hasPassed (reminder) {
      const when = moment(this.assessment.date).subtract(reminder.count, reminder.unit)
      return when.isBefore(Date.now())
    },
    removeReminder (reminder) {
      if (this.hasPassed(reminder)) {
        return
      }

      // API
      this.reminders = this.reminders.filter(r => r._id !== reminder._id)
    },
    addReminder () {
      // Check if count fits with unit
      if (this.count > this.countMax) {
        return
      }

      if (this.hasPassed(this.newReminder)) {
        return
      }

      if (this.reminders.find(r => r.count === this.newReminder.count && r.unit === this.newReminder.unit)) {
        return
      }

      // Push update to server
      this.reminders.push({ ...this.newReminder, _id: Math.random() }) // yes I know. this is for testing.
    }
  }
}
</script>

<style lang="scss" scoped>
.reminder-integration {
  text-transform: capitalize;
}
</style>
