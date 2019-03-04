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
              @click="step = index"
            >
              <a>{{ s.label }}</a>
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
            :courses="courses"
            :course-c-r-n="courseCRN"
            :title="title"
            :description="description"
            :title-place-holder="'Assignment Title - Keep it concise!'"
            :description-place-holder="'(optional) Long description of the assignment here! You can use Markdown!'"
            :due-date="dueDate"
            :due-time="dueTime"
            :time-estimate="timeEstimate"
            :priority="priority"
            @update-crn="setValue('courseCRN', $event)"
            @update-date="setValue('dueDate', $event); nextStep();"
            @update-due-time="setValue('dueTime', $event)"
            @update-title="setValue('title', $event)"
            @update-desc="setValue('description', $event)"
            @update-priority="setValue('priority', $event)"
            @update-time-estimate="setValue('timeEstimate', $event)"
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
import ModalPriorityAndTimeEstimate from '@/views/components/modal/ModalPriorityAndTimeEstimate';

export default {
  name: 'AssignmentsModalAdd',
  components: {
    ModalSelectCourse,
    ModalTitleAndDescription,
    ModalCalendar,
    ModalPriorityAndTimeEstimate
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
      step: 0,
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
          component: 'ModalPriorityAndTimeEstimate'
        }
      ]
    };
  },
  computed: {
    currentStep () {
      return this.steps[this.step];
    },
    isComplete () {
      if (!this.courseCRN || !this.title || !this.dueTime || !this.dueDate) return false;
      return true;
    },
    courseCRN () {
      return this.$store.state.addAssignmentModal.courseCRN;
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
    courses () {
      return this.$store.getters.current_schedule;
    }
  },
  methods: {
    nextStep () {
      this.step += 1;
    },
    lastStep () {
      this.step -= 1;
    },
    setValue (property, value) {
      this.$store.commit('SET_ADD_ASSIGNMENT_MODAL_VALUES', {
        [property]: value
      });
    },
    async save () {
      this.loading = true;
      let request;

      if (!this.isComplete) {
        this.$toasted.error('Make sure you complete every step!');
        return;
      }

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
          priority: this.priority
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
      }

      // Reset important fields
      this.step = 1;
      this.$store.commit('SET_ADD_ASSIGNMENT_MODAL_VALUES', {
        dueTime: '08:00',
        title: '',
        description: '',
        timeEstimate: 1.0,
        priority: 3
      });

      this.loading = false;

      // Close modal
      this.$emit('toggle-modal');

      // Notify user
      this.$toasted.success(
        `Added assignment '${
          request.data.createdAssignment.title
        }' due ${moment(request.data.createdAssignment.dueDate).fromNow()}.`,
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
  -moz-transition: height 1s ease-in-out, left 0.5s ease-in-out;
  -webkit-transition: height 1s ease-in-out, left 0.5s ease-in-out;
  -moz-transition: height 1s ease-in-out, left 0.5s ease-in-out;
  -o-transition: height 1s ease-in-out, left 0.5s ease-in-out;
  transition: height 1s ease-in-out, left 0.5s ease-in-out;
  #add-assignment-time-estimate {
    width: 150px;
  }
}
</style>
