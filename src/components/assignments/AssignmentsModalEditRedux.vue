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
        <div class="steps">
          <div
            v-for="s in steps"
            :key="s.step"
            tag="div"
            class="step-item"
            :class="{ 'is-completed': s.completed,
                      'is-active': s.active }"
            @click="step = s.step; updateSteps()"
          >
            <div class="step-marker">
              <span class="icon">
                <i
                  v-if="s.completed"
                  class="fas fa-check"
                />
                <i
                  v-else
                  class="fas fa-times"
                />
              </span>
            </div>

            <div class="step-details">
              <p class="step-title">
                {{ s.label }}
              </p>
            </div>
          </div>
        </div>
        <hr>
        <transition
          name="fade"
          mode="out-in"
        >
          <ModalSelectCourse
            v-if="step === 1"
            :courses="courses"
            :active-c-r-n="this.assignment.courseCRN"
            @update-crn="assignment.courseCRN = $event"
            @next-step="nextStep()"
          />
          <ModalTitleAndDescription
            v-else-if="step === 2"
            :title="assignment.title"
            :description="assignment.description"
            :title-place-holder="'Assignment Title - Keep it concise!'"
            :description-place-holder="'(optional) Long description of the assignment here! You can use Markdown!'"
            @update-title="assignment.title = $event"
            @update-desc="assignment.description = $event"
          />
          <ModalCalendar
            v-else-if="step === 3"
            @update-date="assignment.dueDate = $event; nextStep();"
          />
          <ModalPriorityAndTimeEstimate
            v-else-if="step === 4"
            :active-c-r-n="assignment.courseCRN"
            :time-hour="assignment.timeHour"
            :time-minute="assignment.timeMinute"
            :timeis-am="assignment.timeisAm"
            :time-estimate="assignment.timeEstimate"
            :priority="assignment.priority"
            @update-timeHour="assignment.timeHour = $event"
            @update-timeMinute="assignment.timeMinute = $event"
            @update-time-is-am="assignment.timeisAm = $event"
            @update-priority="assignment.priority = $event"
            @update-timeEstimate="assignment.timeEstimate = $event"
          />
        </transition>
      </div>
      <footer class="modal-card-foot modal-nav">
        <div
          v-if="step > 1"
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
          class="modal-nav-button save"
          @click="$emit('remove-assignment')"
        >
          <h1>Delete Assignment</h1>
        </div>
        <div
          class="modal-nav-button save"
          @click="save()"
        >
          <h1>Save Assignment</h1>
        </div>

        <!--  @click="$emit('remove-assignment')-->
        <div
          v-if="step !== 4"
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

import ModalSelectCourse from '@/components/modal/ModalSelectCourse';
import ModalTitleAndDescription from '@/components/modal/ModalTitleAndDescription';
import ModalCalendar from '@/components/modal/ModalCalendar';
import ModalPriorityAndTimeEstimate from '@/components/modal/ModalPriorityAndTimeEstimate';

export default {
  name: 'AssignmentsModalAddRedux',
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
    },
    initialAssignment: {
      type: Object,
      default: () => ({
        courseCRN: '',
        title: '',
        description: '',
        dueDate: moment()
          .add(1, 'days')
          .format('YYYY-MM-DD'),
        timeHour: '',
        timeMinute: '',
        timeisAm: false,
        timeEstimate: 1,
        priority: 5
      }),
      required: true
    }
  },
  data () {
    return {
      assignment: this.convertAssignment(this.initialAssignment),
      step: 1,
      steps: [
        {
          label: 'Select course',
          step: 1,
          completed: true,
          active: true
        },
        {
          label: 'Basic Info',
          step: 2,
          completed: true,
          active: false
        },
        {
          label: 'Due Date',
          step: 3,
          completed: true,
          active: false
        },
        {
          label: 'Time',
          step: 4,
          completed: true,
          active: false
        }
      ]
    };
  },
  computed: {
    courses () {
      return this.$store.getters.current_schedule;
    }
  },
  watch: {
    initialAssignment (newA, oldA) {
      this.assignment = this.convertAssignment(newA);
    }
  },
  methods: {
    nextStep () {
      this.step = this.step + 1;
      this.updateSteps();
    },
    lastStep () {
      this.step = this.step - 1;
      this.updateSteps();
    },
    updateSteps () {
      let curStep = this.step;
      this.steps.forEach(function (step_) {
        if (step_.step === curStep) {
          step_.active = true;
        } else {
          step_.active = false;
        }
      });
      if (this.assignment.title === '') {
        this.steps[1].completed = false;
      } else if (this.assignment.title !== '') {
        this.steps[1].completed = true;
      }
    },
    convertAssignment (assignment) {
      const data = Object.assign({}, assignment);
      data.dueDate = moment(assignment.dueDate).format('YYYY-MM-DD');
      let time, hour, minute, isAm;

      time = moment(assignment.dueDate).format('HH:mm');
      time = time.split(':');

      hour = parseInt(time[0]);
      minute = parseInt(time[1]);

      if (hour > 12) {
        hour -= 12;
        isAm = false;
      }

      data.timeHour = hour;
      data.timeMinute = minute;
      data.timeisAm = isAm;

      return data;
    },
    async save () {
      this.updateSteps();

      this.loading = true;
      // TODO: error handle
      let request;

      let complete = this.steps.some(step => !step.completed);

      let time;
      let hour = parseInt(this.assignment.timeHour);
      let minute = parseInt(this.assignment.timeMinute);

      if (this.assignment.timeHour === '') {
        hour = 11;
      }
      if (this.assignment.timeMinute === '') {
        minute = 59;
      }

      if (complete) {
        this.$toasted.error('Make sure you complete every step!');
        return;
      }

      if (!this.assignment.timeisAm && hour !== 12) {
        hour += 12;
      }
      if (hour > 0 && hour < 10 && this.assignment.timeHour.length === 1) {
        hour = '0' + hour;
      }
      if (minute > 0 && minute < 10) {
        minute = '0' + minute;
      }
      time = hour + ':' + minute;

      this.loading = true;

      request = await this.$http.patch(
        `/assignments/a/${this.assignment._id}`,
        {
          title: this.assignment.title,
          description: this.assignment.description,
          dueDate: moment(
            this.assignment.dueDate + ' ' + time,
            'YYYY-MM-DD HH:mm',
            true
          ).toDate(),
          courseCRN: this.assignment.courseCRN,
          timeEstimate: this.assignment.timeEstimate,
          priority: this.assignment.priority
        }
      );

      // Calls API and updates state
      if (this.$store.getters.getUpcomingAssignmentById(this.assignment._id)) {
        this.$store.dispatch(
          'UPDATE_UPCOMING_ASSIGNMENT',
          request.data.updatedAssignment
        );
      }
      this.$emit('edit-assignment', this.assignment);

      this.loading = false;

      // Close modal
      this.$emit('toggle-modal');

      // Notify user
      this.$toasted.info(
        `Edited assignment '${
          request.data.updatedAssignment.title
        }' due ${moment(request.data.updatedAssignment.dueDate).fromNow()}.`,
        {
          action: {
            text: 'Undo'
          },
          icon: 'pen'
        }
      );
    }
  }
};
</script>


<style lang="scss" scoped>
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
    background-color: #dbdbdb;
  }
  border-left: 1px solid #dbdbdb;
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
