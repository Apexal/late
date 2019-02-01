<template>
  <details class="user-overview box">
    <summary>
      <h2 class="subtitle">
        <span
          v-if="student.accountLocked"
          class="icon"
          title="This student's account is locked."
        >
          <i class="fa fa-lock" />
        </span>
        <span class="has-text-grey">
          {{ student.grade_name }}
        </span>
        {{ student.display_name }}
      </h2>
    </summary>

    <div class="setup-checks">
      <hr>
      <b>Setup Checks</b>
      <table class="table">
        <thead>
          <th
            v-for="sc in student.setup_checks"
            :key="sc"
          >
            {{ setupCheckNames[sc] }}
          </th>
        </thead>
        <tbody>
          <tr>
            <td
              v-for="sc in student.setup_checks"
              :key="sc"
            >
              <span class="icon">
                <i
                  class="fa"
                  :class="hasSetupCheck[sc] ? 'fa-check' : 'fa-times'"
                />
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="student-actions">
      <hr>
      <div class="buttons has-addons">
        <button class="button is-small">
          Email
        </button>
        <button class="button is-info is-small">
          View Profile
        </button>
        <button class="button is-danger is-small">
          Lock Account
        </button>
      </div>
    </div>
  </details>
</template>

<script>
export default {
  name: 'AdminStudentListOverview',
  props: ['student'],
  computed: {
    setupCheckNames () {
      return {
        personal_info: 'Personal Info',
        course_schedule: 'Course Schedule',
        unavailability: 'Unavailability',
        integrations: 'Integrations'
      };
    },
    hasSetupCheck () {
      return {
        personal_info: this.student.setup.personal_info,
        course_schedule: this.student.setup.course_schedule.length > 0,
        unavailability: this.student.setup.unavailability.length > 0,
        integrations: this.student.setup.integrations
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.user-overview {
  h2.subtitle {
    display: inline-block;
  }

  .setup-checks {
    .fa.fa-check {
      color: green;
    }
    .fa.fa-times {
      color: red;
    }
  }
}
</style>
