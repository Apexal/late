<template>
  <div class="tile is-child notification is-dark assignments-confirm">
    <p class="title">
      Confirm
    </p>
    <template v-if="unconfirmedAssignments.length > 0">
      <p class="subtitle">
        Did you ever complete:
      </p>
      <div
        v-for="a in unconfirmedAssignments"
        :key="a._id"
        class="is-flex"
      >
        <p style="flex: 1">
          <CourseAssessmentDot
            :course="course(a)"
            :assessment="a"
          />
          <router-link
            class="assessment-link"
            :to="assessmentRoute(a)"
          >
            {{ a.title }}?
          </router-link>
        </p>

        <div class="confirm-buttons">
          <b-button
            size="is-small"
            @click="confirmAssignment(a._id, true)"
          >
            Yes
          </b-button>
          <b-button
            size="is-small"
            @click="confirmAssignment(a._id, false)"
          >
            No
          </b-button>
        </div>
        <hr>
      </div>
    </template>
    <template>
      <p class="subtitle">
        Nothing to confirm!
      </p>
    </template>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'DashboardOverviewAssignmentsConfirm',
  data () {
    return {
      unconfirmedAssignments: []
    };
  },
  async mounted () {
    let response;
    try {
      response = await this.$http.get('/assignments', {
        params: {
          start: moment(this.currentTerm.start).format('YYYY-MM-DD'),
          end: moment(this.rightNow).format('YYYY-MM-DD'),
          completed: false,
          confirmed: false
        }
      });
    } catch (e) {
      this.$toast.open({ type: 'is-danger', message: e.response.data.message });
      return;
    }

    this.unconfirmedAssignments = response.data.assignments;
  },
  methods: {
    async confirmAssignment (assignmentID, didComplete) {
      let response;
      if (didComplete) {
        response = await this.$http.post(
          '/assignments/a/' + assignmentID + '/toggle'
        );
      } else {
        response = await this.$http.patch('/assignments/a/' + assignmentID, {
          confirmed: true,
          completed: false
        });
      }

      this.unconfirmedAssignments = this.unconfirmedAssignments.filter(
        a => a._id !== assignmentID
      );

      this.$toast.open({
        type: 'is-primary',
        message: 'Confirmed assignment\'s status!'
      });
    },
    assessmentRoute (a) {
      return {
        name: a.assessmentType + '-overview',
        params: { [a.assessmentType + 'ID']: a._id }
      };
    },
    course (a) {
      return this.$store.getters.getCourseFromCRN(a.courseCRN);
    }
  }
};
</script>

<style lang="scss" scoped>
.assessment-link {
  text-decoration: none !important;
}
</style>
