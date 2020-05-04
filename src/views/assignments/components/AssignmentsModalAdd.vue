<!--Modals: Add Assignment (2.0)-->
<template>
  <b-modal
    has-modal-card
    class="add-assignment-modal"
    :active="open"
    @close="$emit('toggle-modal')"
  >
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">
          Add Assignment
        </p>
      </header>

      <section class="modal-card-body">
        <div class="tabs is-fullwidth">
          <ul>
            <li
              v-for="(s, index) in steps"
              :key="index"
              :class="{'is-active': index === step}"
              @click="setStep(index)"
            >
              <a>
                <CourseAssessmentDot
                  v-if="courseCRN && s.label === 'Course'"
                  :course="course"
                  :on-click-open-modal="false"
                />
                {{ s.label }}
                <span
                  v-if="completedChecks[s.component]"
                  class="icon"
                >
                  <i class="fa fa-check" />
                </span>
              </a>
            </li>
          </ul>
        </div>
        <transition
          name="fade"
          mode="out-in"
        >
          <Component
            :is="currentStep.component"
            class="component"
            :assessment-type="'assignment'"
            :courses="courses"
            :course-c-r-n="courseCRN"
            :title="title"
            :description="description"
            :title-placeholder="'Assignment title'"
            :description-placeholder="
              'Long description of the assignment'
            "
            :date="dueDate"
            :time="dueTime"
            :time-estimate="timeEstimate"
            :priority-max="5"
            :priority="priority"
            :is-recurring="isRecurring"
            :recurring-days="recurringDays"
            :old-titles="oldTitles"
            @update-crn="setValue('courseCRN', $event)"
            @update-date="
              setValue('dueDate', $event);
              nextStep();
            "
            @update-time="setValue('dueTime', $event.trim())"
            @update-title="setValue('title', $event.trim())"
            @update-description="setValue('description', $event.trim())"
            @update-time-estimate="setValue('timeEstimate', $event)"
            @update-priority="setValue('priority', $event)"
            @update-is-recurring="setValue('isRecurring', $event)"
            @update-recurring-days="setValue('recurringDays', $event)"
            @next-step="nextStep()"
          />
        </transition>
      </section>
      <footer class="modal-card-foot modal-nav">
        <div
          v-if="step > 0"
          class="modal-nav-button back"
          @click="lastStep()"
        >
          <i class="fas fa-arrow-left" />
        </div>
        <div
          class="modal-nav-button cancel"
          @click="cancelClicked"
        >
          <h1>Cancel</h1>
        </div>
        <div
          v-if="isComplete"
          class="modal-nav-button save"
          @click="save()"
        >
          <h1>Add</h1>
        </div>
        <div
          v-if="step !== steps.length - 1"
          class="modal-nav-button next"
          @click="nextStep()"
        >
          <i class="fas fa-arrow-right" />
        </div>
      </footer>
    </div>
  </b-modal>
</template>

<script>
import moment from 'moment'

import ModalSelectCourse from '@/views/assessments/components/modal/ModalSelectCourse'
import ModalCalendar from '@/views/assessments/components/modal/ModalCalendar'
import ModalTitleAndDescription from '@/views/assessments/components/modal/ModalTitleAndDescription'
import ModalTime from '@/views/assessments/components/modal/ModalTime'

export default {
  name: 'AssignmentsModalAdd',
  components: {
    ModalSelectCourse,
    ModalCalendar,
    ModalTitleAndDescription,
    ModalTime
  },
  props: {
    open: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
      loading: false,
      oldTitles: new Set(),
      oldCRN: '',
      steps: [
        {
          label: 'Course',
          completed: false,
          component: 'ModalSelectCourse'
        },
        {
          label: 'Due Date',
          completed: false,
          component: 'ModalCalendar'
        },
        {
          label: 'Title & Details',
          completed: false,
          component: 'ModalTitleAndDescription'
        },
        {
          label: 'Time',
          completed: false,
          component: 'ModalTime'
        }
      ]
    }
  },
  computed: {
    step () {
      return this.$store.state.addAssignmentModal.modalStep
    },
    currentStep () {
      return this.steps[this.step]
    },
    isComplete () {
      if (!this.courseCRN || !this.title || !this.dueTime || !this.dueDate) {
        return false
      }
      return true
    },
    courseCRN () {
      return this.$store.state.addAssignmentModal.courseCRN
    },
    course () {
      return this.$store.getters.getCourseFromCRN(this.courseCRN)
    },
    dueDate () {
      return this.$store.state.addAssignmentModal.dueDate
    },
    dueTime () {
      return this.$store.state.addAssignmentModal.dueTime
    },
    title () {
      return this.$store.state.addAssignmentModal.title
    },
    description () {
      return this.$store.state.addAssignmentModal.description
    },
    timeEstimate () {
      return this.$store.state.addAssignmentModal.timeEstimate
    },
    priority () {
      return this.$store.state.addAssignmentModal.priority
    },
    isRecurring () {
      return this.$store.state.addAssignmentModal.isRecurring
    },
    recurringDays () {
      return this.$store.state.addAssignmentModal.recurringDays
    },
    completedChecks () {
      return {
        ModalSelectCourse: this.courseCRN.length > 0,
        ModalCalendar: !!this.dueDate,
        ModalTitleAndDescription: this.title.length > 0,
        ModalTime: true
      }
    }
  },
  watch: {
    async course (newCourse) {
      if (this.oldCRN === newCourse.crn) return

      const request = await this.$http.get(
        '/assignments?courseCRN=' + newCourse.crn
      )

      this.oldTitles = new Set(
        request.data.assignments
          .reverse()
          .slice(0, 5)
          .map(a => a.title)
      )
      this.oldCRN = newCourse.crn
    }
  },
  methods: {
    cancelClicked () {
      this.$store.commit('RESET_ADD_ASSIGNMENT_MODAL_VALUES')
      this.$emit('toggle-modal')
    },
    nextStep () {
      this.$store.commit('SET_ADD_ASSIGNMENT_MODAL_VALUES', {
        modalStep: this.step + 1
      })
    },
    lastStep () {
      this.$store.commit('SET_ADD_ASSIGNMENT_MODAL_VALUES', {
        modalStep: this.step - 1
      })
    },
    setStep (modalStep) {
      this.$store.commit('SET_ADD_ASSIGNMENT_MODAL_VALUES', {
        modalStep
      })
    },
    setValue (property, value) {
      this.$store.commit('SET_ADD_ASSIGNMENT_MODAL_VALUES', {
        [property]: value
      })
    },
    async save () {
      this.loading = true

      if (!this.isComplete) {
        return this.showError('Make sure you complete every step!')
      }
      // Fix multiple assignments being add with same description
      if (this.$store.state.assessments.upcomingAssessments.find(assessment => assessment.title === this.title && assessment.courseCRN === this.courseCRN && moment(assessment.dueDate).isSame(this.dueDate, 'day'))) {
        // Allow user to cancel adding repeat assignment
        if (!confirm("You've already added an assignment with this name. Do you still want to continue?")) {
          this.$emit('toggle-modal')
          return
        }
      }
      let request
      try {
        request = await this.$http.post('/assignments', {
          title: this.title,
          description: this.description,
          dueDate: moment(
            this.dueDate.format('YYYY-MM-DD') + ' ' + this.dueTime,
            'YYYY-MM-DD HH:mm',
            true
          ).toDate(),
          courseCRN: this.courseCRN,
          timeEstimate: this.timeEstimate,
          priority: this.priority,
          isRecurring: this.isRecurring,
          recurringDays: this.isRecurring ? this.recurringDays : undefined
        })
      } catch (e) {
        this.loading = false
        return this.showError('There was an error adding the assignment. Please try again later.')
      }

      // Update global state if they are not in the past
      if (
        moment(request.data.createdAssignment.dueDate).isAfter(
          moment().startOf('day')
        )
      ) {
        this.$store.dispatch(
          'ADD_UPCOMING_ASSESSMENT',
          request.data.createdAssignment
        )

        if (request.data.recurringAssignments.length > 0) {
          for (const a of request.data.recurringAssignments) {
            this.$store.dispatch('ADD_UPCOMING_ASSESSMENT', a)
          }
        }
      }

      // Reset important fields
      this.$store.commit('SET_ADD_ASSIGNMENT_MODAL_VALUES', {
        modalStep: 0,
        courseCRN: '',
        dueTime: '08:00',
        title: '',
        description: '',
        timeEstimate: 1.0,
        priority: 3,
        isRecurring: false
      })

      this.loading = false

      // Close modal
      this.$emit('toggle-modal')

      // Notify user
      this.$buefy.snackbar.open({
        message: `Added assignment '${
          request.data.createdAssignment.title
        }' due ${moment(request.data.createdAssignment.dueDate).fromNow()}${
          request.data.recurringAssignments.length > 0
            ? ' and ' +
              request.data.recurringAssignments.length +
              ' recurring assignments'
            : ''
        }.`,
        type: 'is-primary',
        position: 'is-bottom',
        actionText: 'View',
        duration: 7000,
        onAction: () => {
          this.$router.push({
            name: 'assignment-overview',
            params: { assignmentID: request.data.createdAssignment._id }
          })
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.modal-card-body {
  padding-top: 0;
}

.step-marker {
  cursor: pointer;
}
//Makes the hovered step icon appear more dynamic
.step-marker:hover {
  background-color: #5b9ba0 !important;
}

//Makes the current step bold
.steps .step-item .step-details .step-title {
  font-weight: inherit;
}
.steps .is-active .step-details {
  font-weight: 600 !important;
}

.modal-nav-button {
  cursor: pointer;
  text-align: center;
  flex-grow: 1;
  padding-top: 15px;
  padding-bottom: 15px;
  transition: 0.12s;
}
.cancel {
  &:hover {
    background-color: #dbdbdb;
  }
}

.back {
  &:hover {
    background-color: #dbdbdb;
    border-bottom-left-radius: 6px;
  }
  flex-grow: 0;
  width: 100px;
  border-right: 1px solid #dbdbdb;
  float: left;
}

.save {
  &:hover {
    background-color: #62b1b7;
  }
  border-bottom-right-radius: 6px;
  background-color: #66c6ce;
  color: white;
}

.next {
  &:hover {
    background-color: #dbdbdb;
    border-bottom-right-radius: 6px;
  }
  flex-grow: 0;
  width: 100px;
  border-left: 1px solid #dbdbdb;
  float: right;
}

.modal-nav {
  padding: 0px;
  font-size: 16px;
  display: flex;
  flex-direction: row;
}

.add-assignment-modal {
  #add-assignment-description {
    width: 100%;
    min-width: 100%;
    max-width: 500px;

    min-height: 100px;
    height: 200px;
    max-height: 500px;
  }

  transition: height 1s ease-in-out, left 0.5s ease-in-out;
  #add-assignment-time-estimate {
    width: 150px;
  }
}
</style>
