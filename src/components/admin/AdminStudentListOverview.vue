<template>
  <details
    class="user-overview box"
    @toggle="getStats()"
  >
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

    <div class="content-stats">
      <hr>
      <div class="level is-mobile">
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">
              Assignments Added
            </p>
            <p>{{ counts.assignments }}</p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">
              Exams Added
            </p>
            <p>{{ counts.exams }}</p>
          </div>
        </div>
        <div class="level-item has-text-centered">
          <div>
            <p class="heading">
              Work Blocks Scheduled
            </p>
            <p>{{ counts.blocks }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="dates">
      <hr>
      <span>
        <b>Joined:</b>
        {{ joinedDateString(student.joined_date) }}
      </span>
      <br>
      <span>
        <b>Last Login:</b>
        {{ joinedDateString(student.last_login) }}
      </span>
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
import moment from 'moment';

export default {
  name: 'AdminStudentListOverview',
  props: ['student'],
  data () {
    return {
      counts: {
        assignments: 0,
        exams: 0,
        blocks: 0
      }
    };
  },
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
  },
  methods: {
    joinedDateString (date) {
      return moment(date).format('M/D/YY h:mm a');
    },
    async getStats () {
      let request;

      request = await this.$http.get(`/students/${this.student._id}`, {
        params: { counts: true }
      });
      this.counts = request.data.counts;
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
    overflow: auto;
    .fa.fa-check {
      color: green;
    }
    .fa.fa-times {
      color: red;
    }
  }
}
</style>
