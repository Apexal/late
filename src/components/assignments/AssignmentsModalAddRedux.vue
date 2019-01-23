<template>
  <div
    :class="{'is-active': open}"
    class="add-assignment-modal modal"
  >
    <div
      class="modal-background fade-in"
      @click="$emit('toggle-modal')"
    />
    <div class="modal-card fade-in">
      <header class="modal-card-head">
        <p class="modal-card-title">
          Add Assignment
        </p>
      </header>

      <section class="modal-card-body">
        <div class="steps">
          <div
            v-for="s in steps"
            tag="div"
            class="step-item"
            :class="{ 'is-completed': s.completed,
                      'is-active': s.active }"
            @click="step = s.step; updateSteps()"
          >
            <div class="step-marker ">
              <span class="icon">
                <i v-if="s.completed"
                  class="fas fa-check"
                />
                <i v-else
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
          <AssessmentAddSelectCourse
            v-if="step === 1"
            :courses="courses"
            @update-crn="courseCRN = $event"
            @next-step="nextStep()"
          />
          <AssessmentAddTitleAndDescription
            v-else-if="step === 2"
            :title="title"
            :description="description"
            @update-title="title = $event"
            @update-desc="description = $event"
          />
          <AssessmentAddCalendar
            v-else-if="step === 3"
            @update-date="dueDate = $event; nextStep();"
          />
          <AssessmentAddPriority
            v-else-if="step === 4"
            :timeEstimate="timeEstimate"
            :priority="priority"
            @update-priority="priority = $event"
            @update-timeEstimate="timeEstimate = $event"
          />
        </transition>
      </section>
      <footer class="modal-card-foot modal-nav">
        <div v-if="step > 1" class="modal-nav-button back">
          <h1 @click="lastStep()">
          Back
          </h1>
        </div>
        <div class="modal-nav-button cancel">
          <h1 @click="$emit('toggle-modal')">
          Cancel Assignment Creation
          </h1>
        </div>
        <div v-if="step === 2 || step === 3" class="modal-nav-button next">
          <h1 @click="nextStep()">
          Next
          </h1>
        </div>
        <div v-if="step === 4" class="modal-nav-button save">
          <h1 @click="testSave()">
          Create Assignment
          </h1>
        </div>
      </footer>
    </div>
  </div>
</template>

<script>
import moment from 'moment';

import 'bulma-steps';

import AssessmentAddSelectCourse from '@/components/assignments/pages/AssessmentAddSelectCourse';
import AssessmentAddTitleAndDescription from '@/components/assignments/pages/AssessmentAddTitleAndDescription';
import AssessmentAddCalendar from '@/components/assignments/pages/AssessmentAddCalendar';
import AssessmentAddPriority from '@/components/assignments/pages/AssessmentAddPriority';

export default {
  name: 'AssignmentsModalAdd',
  components: {
    AssessmentAddSelectCourse,
    AssessmentAddTitleAndDescription,
    AssessmentAddCalendar,
    AssessmentAddPriority
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
      step: 1,
      courseCRN: -1,
      title: '',
      description: '',
      dueDate: '',
      time: '08:00', // HH:mm
      timeEstimate: 1.0,
      priority: 3,
      steps: [
        {
          label: 'Select course',
          step: 1,
          completed: false,
          active: true
        },
        {
          label: 'Basic Info',
          step: 2,
          completed: false,
          active: false
        },
        {
          label: 'Add Calendar',
          step: 3,
          completed: false,
          active: false
        },
        {
          label: 'Priority',
          step: 4,
          completed: false,
          active: false
        }
      ]
    };
  },
  computed: {
    currentTerm () {
      return this.$store.getters.currentTerm;
    },
    maxDate () {
      return moment(this.currentTerm.end).format('YYYY-MM-DD');
    },
    defaultCourseCRN () {
      return this.$store.state.addAssignmentModal.courseCRN;
    },
    dueDateString () {
      return this.$store.getters.addAssignmentModalDueDateString;
    },
    dueTimeString () {
      return this.$store.getters.addAssignmentModalDueTimeString;
    },
    courses () {
      return this.$store.getters.current_schedule;
    },
    today: () => moment().format('YYYY-MM-DD'),

  },
  watch: {
    dueDateString () {
      this.dueDate = this.dueDateString;
    },
    dueTimeString () {
      this.time = this.dueTimeString;
    },
    defaultCourseCRN () {
      this.courseCRN = this.defaultCourseCRN;
    }
  },
  methods: {
    nextStep() {
      this.step = this.step + 1
      this.updateSteps();
    },
    lastStep() {
      this.step = this.step - 1;
      this.updateSteps();
    },
    updateSteps() {
      var curStep = this.step;
      this.steps.forEach(function(step_) {
        if (step_.step === curStep){
          step_.active = true;
        } else {
          step_.active = false;
        }
      });
      if(this.courseCRN != -1){
        this.steps[0].completed = true;
      }
      if(this.description != '' && this.title != ''){
        this.steps[1].completed = true;
      }
      if(this.dueDate != ''){
        this.steps[2].completed = true;
      }
      if(this.step == 4){
        this.steps[3].completed = true;
      }
    },

    testSave(){
      var flag = false;
      this.steps.forEach(function(step_){
        if(step_.completed === false){
          flag = true;
          console.log("step " + step_.step + " is not completed");
        }
      });
      if(flag) return
      console.log("ASSIGNMENT DATA -----------")
      console.log("title: " + this.title);
      console.log("description: " + this.description);
      console.log("crn: " + this.courseCRN);
      console.log("dueDate: " + this.dueDate.format('YYYY-MM-DD'));
      console.log("priority: " + this.priority);
      console.log("timeEstimate: " + this.timeEstimate);
    },

    async save () {
      this.loading = true;
      // TODO: error handle
      let request;

      try {
        request = await this.$http.post('/assignments', {
          title: this.title,
          description: this.description,
          dueDate: moment(
            this.dueDate + ' ' + this.time,
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

      // Update global state
      this.$store.commit(
        'ADD_UPCOMING_ASSIGNMENT',
        request.data.createdAssignment
      );

      // Reset important fields
      this.title = '';
      this.description = '';
      this.timeEstimate = 1;
      this.priority = 3;

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

.step-marker {
  cursor: pointer;
}
//Makes the hovered step icon appear more dynamic
.step-marker:hover {
  background-color: #5b9ba0!important;
}

//Makes the current step bold
.steps .step-item .step-details .step-title {
  font-weight: inherit;
}
.steps .is-active .step-details {
  font-weight: 600!important;
}


.modal-nav-button {
  cursor: pointer;
  text-align: center;
  flex-grow:1;
  padding-top: 15px;
  padding-bottom: 15px;
  transition: 0.12s;
}
.cancel{
  &:hover {
    background-color: #dbdbdb;
  }
}

.back {
  &:hover {
    background-color: #dbdbdb;
    border-bottom-left-radius: 6px;
  }
  border-right: 1px solid #dbdbdb ;
  float: left;
}

.save {
  background-color: #66C6CE;
  color:white;
}

.next {
  &:hover {
    background-color: #dbdbdb;
    border-bottom-right-radius: 6px;
  }
  border-left: 1px solid #dbdbdb ;
  float: right;
}

.modal-nav {
  padding: 0px;
  font-size: 16px;
  display:flex;
  flex-direction:row;
}

.fade-in {
	opacity: 1;
	animation-name: fadeInOpacity;
	animation-iteration-count: 1;
	animation-timing-function: ease-in;
	animation-duration: 0.13s;
}

@keyframes fadeInOpacity {
	0% {
		opacity: 0;
	}
	100% {
		opacity: 1;
	}
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
  -moz-transition: height 1s ease-in-out, left .5s ease-in-out;
    -webkit-transition: height 1s ease-in-out, left .5s ease-in-out;
    -moz-transition: height 1s ease-in-out, left .5s ease-in-out;
    -o-transition: height 1s ease-in-out, left .5s ease-in-out;
    transition: height 1s ease-in-out, left .5s ease-in-out;
  #add-assignment-time-estimate {
    width: 150px;
  }
}
</style>
