<!--Modals: Add exam (2.0)-->
<template>
  <b-modal
    has-modal-card
    :active="open"
    class="add-exam-modal"
    @close="$emit('toggle-modal')"
  >
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">
          Add Exam
        </p>
      </header>

      <div class="modal-card-body">
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
            :assessment-type="'exam'"
            :courses="courses"
            :course-c-r-n="courseCRN"
            :title="title"
            :description="description"
            :title-placeholder="'Exam title'"
            :description-placeholder="
              'Long description of the exam'
            "
            :date="date"
            :time="time"
            :time-estimate="timeEstimate"
            :priority-max="3"
            :priority="priority"
            @update-crn="setValue('courseCRN', $event)"
            @update-date="
              setValue('date', $event);
              nextStep();
            "
            @update-time="setValue('time', $event.trim())"
            @update-title="setValue('title', $event.trim())"
            @update-description="setValue('description', $event.trim())"
            @update-time-estimate="setValue('timeEstimate', $event)"
            @update-priority="setValue('priority', $event)"
            @next-step="nextStep()"
          />
        </transition>
      </div>
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
          @click="$emit('toggle-modal')"
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
import ModalTitleAndDescription from '@/views/assessments/components/modal/ModalTitleAndDescription'
import ModalCalendar from '@/views/assessments/components/modal/ModalCalendar'
import ModalTime from '@/views/assessments/components/modal/ModalTime'

export default {
  name: 'ExamsModalAdd',
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
      steps: [
        {
          label: 'Course',
          completed: false,
          component: 'ModalSelectCourse'
        },
        {
          label: 'Date',
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
      return this.$store.state.addExamModal.modalStep
    },
    currentStep () {
      return this.steps[this.step]
    },
    isComplete () {
      if (!this.courseCRN || !this.title || !this.time || !this.date) {
        return false
      }
      return true
    },
    courseCRN () {
      return this.$store.state.addExamModal.courseCRN
    },
    course () {
      return this.$store.getters.getCourseFromCRN(this.courseCRN)
    },
    date () {
      return this.$store.state.addExamModal.date
    },
    time () {
      return this.$store.state.addExamModal.time
    },
    title () {
      return this.$store.state.addExamModal.title
    },
    description () {
      return this.$store.state.addExamModal.description
    },
    timeEstimate () {
      return this.$store.state.addExamModal.timeEstimate
    },
    priority () {
      return this.$store.state.addExamModal.priority
    },
    completedChecks () {
      return {
        ModalSelectCourse: this.courseCRN.length > 0,
        ModalCalendar: !!this.date,
        ModalTitleAndDescription: this.title.length > 0,
        ModalTime: true
      }
    }
  },
  methods: {
    nextStep () {
      this.$store.commit('SET_ADD_EXAM_MODAL_VALUES', {
        modalStep: this.step + 1
      })
    },
    lastStep () {
      this.$store.commit('SET_ADD_EXAM_MODAL_VALUES', {
        modalStep: this.step - 1
      })
    },
    setStep (modalStep) {
      this.$store.commit('SET_ADD_EXAM_MODAL_VALUES', {
        modalStep
      })
    },
    setValue (property, value) {
      this.$store.commit('SET_ADD_EXAM_MODAL_VALUES', {
        [property]: value
      })
    },
    async save () {
      this.loading = true

      if (!this.isComplete) {
        return this.showError('Make sure you complete every step!')
      }

      let request
      try {
        request = await this.$http.post('/exams', {
          title: this.title,
          description: this.description,
          date: moment(
            this.date.format('YYYY-MM-DD') + ' ' + this.time,
            'YYYY-MM-DD HH:mm',
            true
          ).toDate(),
          courseCRN: this.courseCRN,
          priority: this.priority,
          timeEstimate: this.timeEstimate
        })
      } catch (e) {
        this.loading = false
        return this.showError('There was an error adding the exam. Please try again later.')
      }

      // Update global state if they are not in the past
      if (
        moment(request.data.createdExam.date).isAfter(
          moment().startOf('day')
        )
      ) {
        this.$store.dispatch(
          'ADD_UPCOMING_ASSESSMENT',
          request.data.createdExam
        )
      }

      // Reset important fields
      this.$store.commit('SET_ADD_EXAM_MODAL_VALUES', {
        modalStep: 0,
        courseCRN: '',
        dueTime: '08:00',
        title: '',
        description: '',
        timeEstimate: 5.0,
        priority: 2
      })

      this.loading = false

      this.$emit('toggle-modal')

      const message = `Added exam '${request.data.createdExam.title}' ${moment(
        request.data.createdExam.date
      ).fromNow()}.`

      this.$buefy.snackbar.open({
        message,
        type: 'is-primary',
        position: 'is-bottom',
        actionText: 'View',
        duration: 7000,
        onAction: () => {
          this.$router.push({
            name: 'exam-overview',
            params: { examID: request.data.createdExam._id }
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

.add-exam-modal {
  #add-exam-description {
    width: 100%;
    min-width: 100%;
    max-width: 500px;

    min-height: 100px;
    height: 200px;
    max-height: 500px;
  }

  transition: height 1s ease-in-out, left 0.5s ease-in-out;
  #add-exam-time-estimate {
    width: 150px;
  }
}
</style>
