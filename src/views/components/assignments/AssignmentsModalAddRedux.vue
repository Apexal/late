<template>
  <div
    :class="{'is-active': open}"
    class="add-assignment-modal modal"
  >
    <div
      class="modal-background"
      @click="$emit('toggle-modal')"
    />
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">
          Add Assignment
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
                <span
                  v-if="courseCRN && s.label === 'Course'"
                  class="dot course-dot"
                  :title="course.longname"
                  :style="'background-color: ' + course.color"
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
            :title-placeholder="'Assignment Title - Keep it concise!'"
            :description-placeholder="'(optional) Long description of the assignment here! You can use Markdown!'"
            :date="dueDate"
            :time="dueTime"
            :time-estimate="timeEstimate"
            :priority-max="5"
            :priority="priority"
            :is-recurring="isRecurring"
            :recurring-days="recurringDays"
            @update-crn="setValue('courseCRN', $event)"
            @update-date="setValue('dueDate', $event); nextStep();"
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
          <h1>Create Assignment</h1>
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
  </div>
</template>

<script>
import moment from 'moment';

import 'bulma-steps';

import ModalSelectCourse from '@/views/components/modal/ModalSelectCourse';
import ModalTitleAndDescription from '@/views/components/modal/ModalTitleAndDescription';
import ModalCalendar from '@/views/components/modal/ModalCalendar';
import ModalTime from '@/views/components/modal/ModalTime';

export default {
  name: 'AssignmentsModalAdd',
  components: {
    ModalSelectCourse,
    ModalTitleAndDescription,
    ModalCalendar,
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
          label: 'Basic Info',
          completed: false,
          component: 'ModalTitleAndDescription'
        },
        {
          label: 'Due Date',
          completed: false,
          component: 'ModalCalendar'
        },
        {
          label: 'Time',
          completed: false,
          component: 'ModalTime'
        }
      ]
    };
  },
  computed: {
    step () {
      return this.$store.state.addAssignmentModal.modalStep;
    },
    currentStep () {
      return this.steps[this.step];
    },
    isComplete () {
      if (!this.courseCRN || !this.title || !this.dueTime || !this.dueDate) {
        return false;
      }
      return true;
    },
    courseCRN () {
      return this.$store.state.addAssignmentModal.courseCRN;
    },
    course () {
      return this.$store.getters.getCourseFromCRN(this.courseCRN);
    },
    dueDate () {
      return this.$store.state.addAssignmentModal.dueDate;
    },
    dueTime () {
      return this.$store.state.addAssignmentModal.dueTime;
    },
    title () {
      return this.$store.state.addAssignmentModal.title;
    },
    description () {
      return this.$store.state.addAssignmentModal.description;
    },
    timeEstimate () {
      return this.$store.state.addAssignmentModal.timeEstimate;
    },
    priority () {
      return this.$store.state.addAssignmentModal.priority;
    },
    isRecurring () {
      return this.$store.state.addAssignmentModal.isRecurring;
    },
    recurringDays () {
      return this.$store.state.addAssignmentModal.recurringDays;
    },
    courses () {
      return this.$store.getters.current_schedule;
    },
    completedChecks () {
      return {
        ModalSelectCourse: this.courseCRN.length > 0,
        ModalTitleAndDescription: this.title.length > 0,
        ModalCalendar: !!this.dueDate,
        ModalTime: true
      };
    }
  },
  methods: {
    nextStep () {
      this.$store.commit('SET_ADD_ASSIGNMENT_MODAL_VALUES', {
        modalStep: this.step + 1
      });
    },
    lastStep () {
      this.$store.commit('SET_ADD_ASSIGNMENT_MODAL_VALUES', {
        modalStep: this.step - 1
      });
    },
    setStep (modalStep) {
      this.$store.commit('SET_ADD_ASSIGNMENT_MODAL_VALUES', {
        modalStep
      });
    },
    setValue (property, value) {
      this.$store.commit('SET_ADD_ASSIGNMENT_MODAL_VALUES', {
        [property]: value
      });
    },
    async save () {
      this.loading = true;

      if (!this.isComplete) {
        this.$toasted.error('Make sure you complete every step!');
        return;
      }

      let request;
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
        });
      } catch (e) {
        this.$toasted.error(
          'There was an error adding the assignment. Please try again later.'
        );
        this.loading = false;
        return;
      }

      // Update global state if they are not in the past
      if (
        moment(request.data.createdAssignment.dueDate).isAfter(
          moment().startOf('day')
        )
      ) {
        this.$store.dispatch(
          'ADD_UPCOMING_ASSIGNMENT',
          request.data.createdAssignment
        );

        if (request.data.recurringAssignments.length > 0) {
          for (let a of request.data.recurringAssignments) {
            this.$store.dispatch('ADD_UPCOMING_ASSIGNMENT', a);
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
      });

      this.loading = false;

      // Close modal
      this.$emit('toggle-modal');

      // Notify user
      this.$toasted.success(
        `Added assignment '${
          request.data.createdAssignment.title
        }' due ${moment(request.data.createdAssignment.dueDate).fromNow()}${
          request.data.recurringAssignments.length > 0
            ? ' and ' +
              request.data.recurringAssignments.length +
              ' recurring assignments'
            : ''
        }.`,
        {
          icon: 'plus',
          action: {
            text: 'View',
            push: {
              name: 'assignments-overview',
              params: { assignmentID: request.data.createdAssignment._id }
            }
          }
        }
      );
    }
  }
};
</script>


<style lang="scss" scoped>
.modal-card-body {
  padding-top: 0;
}

.course-dot {
  margin-right: 5px;
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
