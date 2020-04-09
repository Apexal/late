<!--Assessments: Individual assessment page-->
<template>
  <div class="assessment-overview">
    <canvas id="confetti-canvas" />
    <AssignmentsModalEdit
      v-if="assessmentType === 'assignment'"
      :open="editing"
      :initial-assignment="assessment"
      @toggle-modal="editing = !editing"
      @updated-assessment="updatedAssessment"
      @remove-assignment="removeAssessment"
    />
    <ExamsModalEdit
      v-else-if="assessmentType === 'exam'"
      :open="editing"
      :initial-exam="assessment"
      @toggle-modal="editing = !editing"
      @updated-assessment="updatedAssessment"
      @remove-exam="removeAssessment"
    />
    <section class="section">
      <b-loading
        :is-full-page="false"
        :active="loading"
        :can-cancel="false"
      />

      <AssessmentOverviewTitle
        :assessment-type="'assignment'"
        :assessment="assessment"
        @toggle-completed="toggleCompleted"
        @updated-assessment="updatedAssessment"
      />

      <div>
        <AssessmentOverviewStats
          :assessment="assessment"
          @not-fully-scheduled-click="notFullyScheduledClick"
          @updated-assessment="updatedAssessment"
        />

        <AssessmentOverviewDescription
          :assessment="assessment"
          @updated-assessment="updatedAssessment"
        />
      </div>
      <AssignmentOverviewTabs
        v-if="assessmentType === 'assignment'"
        ref="assignment-tabs"
        :tab="tab"
        :assignment="assessment"
        :loading="loading || commentLoading"
        @set-tab="tabChanged"
        @toggle-completed="toggleCompleted"
        @updated-assessment="updatedAssessment"
      />

      <ExamOverviewTabs
        v-else
        ref="exam-tabs"
        :tab="tab"
        :exam="assessment"
        :loading="loading || commentLoading"
        @set-tab="tabChanged"
        @updated-assessment="updatedAssessment"
      />

      <hr>
      <AssessmentOverviewActionButtons
        :assessment="assessment"
        :loading="loading"
        @toggle-editing="toggleEditing"
        @copy-assessment="copyAssessment"
        @set-tab="tabChanged"
      />
    </section>
  </div>
</template>

<script>
import ConfettiGenerator from 'confetti-js'
// import VueMarkdown from 'vue-markdown';

// Page components
import AssessmentOverviewStats from '@/views/assessments/components/overview/AssessmentOverviewStats'
import AssessmentOverviewDescription from '@/views/assessments/components/overview/AssessmentOverviewDescription'
import AssessmentOverviewActionButtons from '@/views/assessments/components/overview/AssessmentOverviewActionButtons'
import AssessmentOverviewTitle from '@/views/assessments/components/overview/AssessmentOverviewTitle'

import AssignmentOverviewTabs from '@/views/assignments/components/overview/AssignmentOverviewTabs'
import AssignmentsModalEdit from '@/views/assignments/components/AssignmentsModalEdit'

import ExamsModalEdit from '@/views/exams/components/ExamsModalEdit'
import ExamOverviewTabs from '@/views/exams/components/overview/ExamOverviewTabs'

export default {
  name: 'AssessmentsOverviewPage',
  components: {
    AssessmentOverviewDescription,
    AssessmentOverviewTitle,
    AssessmentOverviewActionButtons,
    // VueMarkdown,
    ExamsModalEdit,
    ExamOverviewTabs,
    AssignmentsModalEdit,
    AssignmentOverviewTabs,
    AssessmentOverviewStats
  },
  props: {
    assessmentType: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      tab: 'schedule',
      commentLoading: false,
      toggleLoading: false,
      loading: true,
      isUpcoming: false,
      assessment: {},
      editing: false,
      confetti: null,
      confettiSettings: { target: 'confetti-canvas', clock: 75, max: 150 }
    }
  },
  sockets: {
    'collaborator joined assessment room' (rcsID) {
      this.$buefy.toast.open({ type: 'is-info', message: `<b>${rcsID}</b> is now viewing this assignment.` })
    },
    'collaborator left assessment room' (rcsID) {
      this.$buefy.toast.open({ type: 'is-info', message: `<b>${rcsID}</b> is no longer viewing this assignment.` })
    },
    'updated assessment' ({ assessment }) {
      this.assessment = assessment
    }
  },
  computed: {
    assessmentID () {
      return this.$route.params[this.assessmentType + 'ID']
    }
  },
  beforeRouteLeave (to, from, next) {
    if (!this.isUpcoming) {
      this.$socket.client.emit('leave assessment room', this.assessment._id)
    }
    next()
  },
  watch: {
    $route: 'getAssessment',
    assessment (newAssessment) {
      document.title = `${newAssessment.title} | LATE`
      this.editedDescription = newAssessment.description
    }
  },
  mounted () {
    // eslint-disable-next-line no-undef
    this.confetti = new ConfettiGenerator(this.confettiSettings)
  },
  created () {
    this.getAssessment()
  },
  methods: {
    tabChanged (newTab) {
      this.tab = newTab
    },
    toggleEditing () {
      this.editing = !this.editing
    },
    scrollToTop () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    },
    async updatedAssessment (updatedAssessment) {
      this.assessment = updatedAssessment
      this.$socket.client.emit('updated assessment', updatedAssessment)
    },
    notFullyScheduledClick () {
      this.tab = 'schedule'
      this.$nextTick(() => {
        document.getElementById('assessment-work-schedule').scrollIntoView({ behavior: 'smooth' })
      })
    },
    copyAssessment () {
      this.$store.dispatch(
        'COPY_' + this.assessmentType.toUpperCase() + '_TO_MODAL',
        this.assessment
      )
      this.$store.commit(
        'TOGGLE_ADD_' + this.assessmentType.toUpperCase() + '_MODAL'
      )
    },
    async toggleCompleted () {
      if (this.assessmentType !== 'assignment') return

      this.$buefy.dialog.confirm({
        message: `Mark this assignment as <b>${
          this.assessment.completed ? 'incomplete' : 'complete'
        }</b>?`,
        onConfirm: async () => {
          this.toggleLoading = true

          let updatedAssessment
          try {
            updatedAssessment = await this.$store.dispatch(
              'TOGGLE_ASSIGNMENT',
              this.assessment
            )

            this.$buefy.toast.open({
              message: updatedAssessment.completed
                ? 'Marked as complete. Nice job!'
                : 'Marked as incomplete.',
              type: 'is-primary'
            })

            if (updatedAssessment.completed) {
              this.confetti.render()
              setTimeout(() => this.confetti.clear(), 2000)
            }
          } catch (e) {
            this.showError(e.response.data.message)
            this.toggleLoading = false
            return
          }

          this.updatedAssessment(updatedAssessment)

          this.toggleLoading = false
        }
      })
    },
    async getAssessment () {
      // If its an upcoming assignment, we already have the data on it
      if (this.$store.getters.getUpcomingAssessmentById(this.assessmentID)) {
        this.assessment = this.$store.getters.getUpcomingAssessmentById(this.assessmentID)
        this.loading = false
        this.isUpcoming = true

        if (this.assessment.completed || this.passed) this.tab = 'comments'
        this.$socket.client.emit('join assessment room', this.assessment._id)
        return
      }

      // Not an upcoming assessment

      this.tab = 'comments'
      this.loading = true
      this.isUpcoming = false

      let request
      const apiURL =
        this.assessmentType === 'assignment' ? '/assignments/a/' : '/exams/e/'
      try {
        request = await this.$http.get(apiURL + this.assessmentID)
      } catch (e) {
        this.loading = false
        this.$router.push('/coursework')

        return this.showError(e.response.data.message)
      }

      this.assessment = request.data[this.assessmentType]

      this.editedDescription = this.assessment.description
      document.title = `${this.assessment.title} | LATE`
      this.$socket.client.emit('join assessment room', this.assessment._id)
      this.loading = false
    },
    async removeAssessment () {
      // Confirm user wants to remove assessment
      this.$buefy.dialog.confirm({
        message: `Permanently remove this ${this.assessmentType}?`,
        onConfirm: async () => {
          const assessmentTitle = this.assessment.title

          if (this.assessment.isRecurring) {
            this.$buefy.dialog.confirm({
              message:
                'This is a <b>repeating assignment</b>. Remove just this one or this and future ones?',
              confirmText: 'Future Assignments',
              cancelText: 'Just This One',
              onConfirm: async () => {
                try {
                  await this.$store.dispatch(
                    'REMOVE_ASSIGNMENT_AND_RECURRING',
                    this.assessment
                  )
                } catch (e) {
                  return this.showError(e.response.data.message)
                }
                this.$buefy.toast.open({
                  message: `Successfully removed repeating assignment <b>${assessmentTitle}</b> and future ones.`,
                  type: 'is-success',
                  duration: 3000
                })

                this.$router.push('/coursework')
              },
              onCancel: async () => {
                try {
                  await this.$store.dispatch(
                    'REMOVE_ASSESSMENT',
                    this.assessment
                  )
                } catch (e) {
                  return this.showError(e.response.data.message)
                }

                // Notify user of success
                this.$buefy.toast.open({
                  message: `Successfully removed single repeating assignment <b>${assessmentTitle}</b>.`,
                  type: 'is-success',
                  duration: 3000
                })

                this.$router.push('/coursework')
              }
            })
          } else {
            try {
              await this.$store.dispatch('REMOVE_ASSESSMENT', this.assessment)
            } catch (e) {
              return this.showError(e.response.data.message)
            }

            // Notify user of success
            this.$buefy.toast.open({
              message: `Successfully removed ${
                this.assessment.assessmentType
              } <b>${assessmentTitle}</b>.`,
              type: 'is-success',
              duration: 3000
            })

            this.$router.push('/coursework')
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.margin-right {
  margin-right: 10px;
}

.margin-left {
  margin-left: 2px !important;
}

#confetti-canvas {
  z-index: -1;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
