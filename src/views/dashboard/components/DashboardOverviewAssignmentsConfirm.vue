<template>
  <div
    v-if="unconfirmedAssignments.length"
    class="tile is-child notification is-primary assignments-confirm"
  >
    <p class="title">
      Confirm
    </p>
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

      <div class="confirm-buttons buttons has-addons">
        <a
          class="button is-pulled-right"
          @click="confirmAssignment(a._id, true)"
        >
          Yes
        </a>
        <a
          class="button is-pulled-right"
          @click="confirmAssignment(a._id, false)"
        >
          No
        </a>
      </div>
      <hr>
    </div>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'DashboardOverviewAssignmentsConfirm',
  data () {
    return {
      unconfirmedAssignments: []
    }
  },
  async mounted () {
    let response
    try {
      response = await this.$http.get('/assignments', {
        params: {
          start: moment(this.currentTerm.startDate).format('YYYY-MM-DD'),
          end: moment(this.rightNow).format('YYYY-MM-DD'),
          completed: false,
          confirmed: false
        }
      })
    } catch (e) {
      return this.showError(e.response.data.message)
    }

    this.unconfirmedAssignments = response.data.assignments
  },
  methods: {
    async confirmAssignment (assignmentID, didComplete) {
      try {
        if (didComplete) {
          await this.$http.post(
            '/assignments/a/' + assignmentID + '/toggle'
          )
        } else {
          await this.$http.patch('/assignments/a/' + assignmentID, {
            confirmed: true,
            completed: false
          })
        }
      } catch (e) {
        this.$buefy.toast.open({ type: 'is-error', message: e.response.data.message })
        return
      }

      this.unconfirmedAssignments = this.unconfirmedAssignments.filter(
        a => a._id !== assignmentID
      )

      this.$buefy.toast.open({
        type: 'is-primary',
        message: 'Confirmed assignment\'s status!'
      })
    },
    assessmentRoute (a) {
      return {
        name: a.assessmentType + '-overview',
        params: { [a.assessmentType + 'ID']: a._id }
      }
    },
    course (a) {
      return this.$store.getters.getCourseFromCRN(a.courseCRN)
    }
  }
}
</script>

<style lang="scss" scoped>
.assignments-confirm {
  padding-right: 24px;
  border-right: 1px solid white;
}

.assessment-link {
  text-decoration: none !important;
}
</style>
