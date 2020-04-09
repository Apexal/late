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
          v-for="reminder in assessment.reminders"
          :key="reminder._id"
          :class="{'has-text-grey': hasPassed(reminder)}"
          class="reminder"
        >
          <td class="reminder-integration">
            {{ reminder.integration }}
          </td>
          <td
            class="reminder-count"
            :title="fromNow(reminder.datetime)"
          >
            {{ reminder.count }} {{ reminder.unit }} before
          </td>
          <td>
            <i
              v-if="!hasPassed(reminder)"
              class="fas fa-times has-text-danger remove-reminder"
              @click="removeReminder(reminder)"
            />
          </td>
        </tr>
      </tbody>
      <tfoot>
        <i class="has-text-grey">
          You can add <b>{{ 4 - assessment.reminders.length }}</b> more reminders.
        </i>
      </tfoot>
    </table>

    <form
      v-if="assessment.reminders.length < 4"
      @submit.prevent="addReminder"
    >
      <b-field>
        <b-select
          v-model="newReminder.integration"
          placeholder="Method of contact"
        >
          <option value="email">
            Email Me
          </option>
          <option
            v-if="user.integrations.sms.verified"
            value="sms"
          >
            Text Me
          </option>
          <!-- <option value="discord">
            Discord DM
          </option> -->
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
            Days Before
          </option>
          <option value="hours">
            Hours Before
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
    },
    isValid () {
      if (this.assessment.reminders.length >= 4) {
        return false
      }

      if (this.newReminder.count > this.countMax) {
        return false
      }

      if (this.hasPassed(this.newReminder)) {
        return false
      }

      if (this.assessment.reminders.find(r => r.count === this.newReminder.count && r.unit === this.newReminder.unit)) {
        return false
      }

      return true
    }
  },
  methods: {
    hasPassed (reminder) {
      const when = moment(this.assessment.date).subtract(reminder.count, reminder.unit)
      return when.isBefore(Date.now())
    },
    async updateAssessment (updates) {
      let updatedAssessment
      try {
        updatedAssessment = await this.$store.dispatch('UPDATE_ASSESSMENT', {
          assessmentID: this.assessment._id,
          assessmentType: this.assessment.assessmentType,
          updates
        })
      } catch (e) {
        return this.showError(e.response.data.message)
      }

      this.$emit('updated-assessment', updatedAssessment)

      this.$buefy.toast.open({
        message: 'Added reminder!',
        type: 'is-success'
      })
    },
    async addReminder () {
      // Check if count fits with unit
      if (!this.isValid) {
        return
      }

      const finalReminder = {
        ...this.newReminder,
        datetime: moment(this.assessment.date).subtract(this.newReminder.count, this.newReminder.unit)
      }

      await this.updateAssessment({ reminders: [...this.assessment.reminders, finalReminder] })
    },
    async removeReminder (reminder) {
      if (this.hasPassed(reminder)) {
        return
      }

      // API
      const reminders = this.assessment.reminders.filter(r => r._id !== reminder._id)

      await this.updateAssessment({ reminders })
    }
  }
}
</script>

<style lang="scss" scoped>
.reminder-integration {
  text-transform: capitalize;
}

.remove-reminder {
  cursor: pointer;
}
</style>
