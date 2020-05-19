<template>
  <div class="assignments-overdue">
    <p class="has-text-centered is-pulled-right-desktop overdue-button-holder">
      <button
        v-if="overdueAssignments.length > 0"
        class="button is-danger"
        @click="modalActive = !modalActive"
      >
        <span class="icon">
          <i class="fas fa-exclamation-circle" />
        </span>
        <span>
          {{ overdueAssignments.length }} Overdue Assignments
        </span>
      </button>
    </p>

    <div
      class="modal"
      :class="{'is-active': modalActive}"
    >
      <div
        class="modal-background"
        @click="modalActive = false"
      />
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">
            Overdue Assignments
          </p>
        </header>
        <section class="modal-card-body">
          <p
            v-if="overdueAssignments.length === 0"
            class="has-text-grey has-text-centered"
          >
            No overdue assignments! <em>Nice.</em>
          </p>
          <div
            v-for="assignment in overdueAssignments"
            :key="assignment.id"
            class="is-flex assignment-holder"
          >
            <CourseAssessmentDot
              class="is-hidden-touch"
              :assessment="assignment"
              :course="course(assignment)"
            />
            <div class="is-flex is-flex-column assignment-details">
              <div>
                <strong>{{ course(assignment).title }}</strong>
                <span class="has-text-weight-medium assignment-title">{{ assignment.title }}</span>
                <p class="is-hidden-desktop">
                  Was due {{ fromNow(assignment.dueDate) }} on {{ shortDateTimeFormat(assignment.dueDate) }}
                </p>
              </div>

              <p class="actions has-text-grey">
                <router-link
                  class="has-text-grey"
                  :to="{name: 'assignment-overview', params: {assignmentID: assignment.id}}"
                >
                  View
                </router-link>
                |
                <a
                  class="has-text-grey"
                  href="#"
                  @click="rescheduleAssignment(assignment)"
                >Reschedule to Tonight</a>
                |
                <a
                  class="has-text-grey"
                  href="#"
                  @click="completeAssignment(assignment)"
                >Mark Complete</a>
                |
                <a
                  class="has-text-grey"
                  href="#"
                  @click="confirmAssignment(assignment)"
                >Ignore</a>
              </p>
            </div>
            <span
              class="is-hidden-touch tooltip has-tooltip-left"
              :data-tooltip="shortDateTimeFormat(assignment.dueDate)"
            >due {{ fromNow(assignment.dueDate) }}</span>
          </div>
        </section>
        <footer class="modal-card-foot">
          <button
            class="button"
            @click="modalActive = false"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'AssignmentsOverdue',
  data () {
    return {
      modalActive: false,
      overdueAssignments: []
    }
  },
  async mounted () {
    await this.getOverdueAssignments()
  },
  methods: {
    course (assignment) {
      return this.$store.getters.getCourseFromCRN(assignment.courseCRN)
    },
    async getOverdueAssignments () {
      const params = {
        completed: false,
        confirmed: false,
        termCode: this.currentTerm.code,
        start: moment(this.currentTerm.startDate).format('YYYY-MM-DD'),
        end: moment(this.rightNow).format('YYYY-MM-DD')
      }
      const response = await this.$http.get('/assignments', { params })
      this.overdueAssignments = response.data.assignments.reverse() // Reverse to sort by most recent
    },
    async rescheduleAssignment (assignment) {
      try {
        const tonight = moment(this.rightNow).hours(23).minutes(59)
        const updates = {
          dueDate: tonight.toDate()
        }
        await this.$store.dispatch('UPDATE_ASSESSMENT', { assessmentType: 'assignment', assessmentID: assignment.id, updates })
        this.overdueAssignments = this.overdueAssignments.filter(a => a.id !== assignment.id)

        this.$buefy.toast.open({
          message: 'Rescheduled assignment to tonight at midnight!',
          type: 'is-primary'
        })
      } catch (e) {
        this.showError('Failed to reschedule.')
      }
    },
    async completeAssignment (assignment) {
      try {
        const toggledAssignment = await this.$store.dispatch(
          'TOGGLE_ASSIGNMENT',
          assignment
        )
        this.overdueAssignments = this.overdueAssignments.filter(a => a.id !== assignment.id)
        this.$buefy.toast.open({
          message: 'Marked assignment complete!',
          type: 'is-primary'
        })
      } catch (e) {
        this.showError('Failed to complete the assignment.')
      }
    },
    async confirmAssignment (assignment) {
      try {
        await this.$http.patch('/assignments/a/' + assignment.id, {
          confirmed: true
        })
        this.$buefy.toast.open({
          message: 'Ignored the incomplete assignment.',
          type: 'is-warning'
        })
        this.overdueAssignments = this.overdueAssignments.filter(a => a.id !== assignment.id)
      } catch (e) {
        this.showError('Failed to ignore the assignment.')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.assignment-title {
  margin-left: 4px;
}

.is-flex-column {
  flex-direction: column;
}

.assignment-holder {
  align-items: center;
  padding: 20px 0;
  border-bottom: 2px solid rgb(219, 219, 219);
}

.assignment-holder:first-child {
  padding-top: 0;
}

.assignment-holder:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.assignment-holder > :first-child {
  font-size: 1.5em;
  padding-right: 10px;
}

.assignment-details {
  flex: 1;
}

.overdue-button-holder {
  margin-bottom: 20px;
}

@media screen and (min-width: 768px) {
  .overdue-button-holder {
    margin-bottom: 0;
  }
  .is-pulled-right-desktop {
    float: right;
  }
}
</style>
