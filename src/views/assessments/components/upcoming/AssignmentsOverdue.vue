<template>
  <div class="assignments-overdue">
    <button
      v-if="overdueAssignments.length > 0"
      class="button is-danger is-pulled-right"
      @click="modalActive = !modalActive"
    >
      <span class="icon">
        <i class="fas fa-exclamation-circle" />
      </span>
      <span>
        {{ overdueAssignments.length }} Overdue Assignments
      </span>
    </button>

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
          <div class="columns is-multiline">
            <div
              v-for="assignment in overdueAssignments"
              :key="assignment.id"
              class="column is-half"
            >
              <CourseAssessmentDot
                :assessment="assignment"
                :course="course(assignment)"
              />
              <strong class="assignment-title">{{ assignment.title }}</strong>
              <p>Was due {{ fromNow(assignment.dueDate) }} on {{ shortDateTimeFormat(assignment.dueDate) }}</p>
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
export default {
  name: 'AssignmentsOverdue',
  data () {
    return {
      modalActive: false,
      overdueAssignments: []
    }
  },
  computed: {
    today () {
      return this.now
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
        dueDate: { $lt: this.now }
      }
      const response = await this.$http.get('/assignments', { params })
      this.overdueAssignments = response.data.assignments.reverse() // Reverse to sort by most recent
    },
    async completeAssignment (assignment) {
      const toggledAssignment = await this.$store.dispatch(
        'TOGGLE_ASSIGNMENT',
        assignment
      )
    },
    async confirmAssignment (assignment) {
      await this.$http.patch('/assignments/a/' + assignment.id, {
        confirmed: true
      })
      this.overdueAssignments = this.overdueAssignments.filter(a => a.id !== assignment.id)
    }
  }
}
</script>

<style lang="scss" scoped>
.overdue-assignments-holder.scroll {
  overflow: auto;
  width: auto;
  white-space: nowrap;
  max-width: 100%;
  scrollbar-width: thin;

  .overdue-assignment {
    display: inline-block;
    padding: 5px 10px;
  }
}
</style>
