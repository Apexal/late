<template>
  <div
    :class="{'is-active': open}"
    class="add-exam-modal modal"
  >
    <div
      class="modal-background"
      @click="$emit('toggle-modal')"
    />
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
              @click="step = index"
            >
              <a>
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
            :title-placeholder="'Exam Title - Keep it concise!'"
            :description-placeholder="'(optional) Long description of the exam here! You can use Markdown!'"
            :date="date"
            :time="time"
            :time-estimate="timeEstimate"
            :priority-max="3"
            :priority="priority"
            @update-crn="setValue('courseCRN', $event)"
            @update-date="setValue('date', $event); nextStep();"
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
          <h1>Add Exam</h1>
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
import ModalSelectCourse from '@/views/components/modal/ModalSelectCourse';
import ModalTitleAndDescription from '@/views/components/modal/ModalTitleAndDescription';
import ModalCalendar from '@/views/components/modal/ModalCalendar';
import ModalTime from '@/views/components/modal/ModalTime';

export default {
  name: 'ExamsModalAddRedux',
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
          label: 'Date',
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
    currentStep () {
      return this.steps[this.step];
    },
    isComplete () {
      if (!this.courseCRN || !this.title || !this.time || !this.date) {
        return false;
      }
      return true;
    },
    courseCRN () {
      return this.$store.state.addExamModal.courseCRN;
    },
    date () {
      return this.$store.state.addExamModal.date;
    },
    time () {
      return this.$store.state.addExamModal.time;
    },
    title () {
      return this.$store.state.addExamModal.title;
    },
    description () {
      return this.$store.state.addExamModal.description;
    },
    timeEstimate () {
      return this.$store.state.addExamModal.timeEstimate;
    },
    priority () {
      return this.$store.state.addExamModal.priority;
    },
    courses () {
      return this.$store.getters.current_schedule;
    },
    completedChecks () {
      return {
        ModalSelectCourse: this.courseCRN.length > 0,
        ModalTitleAndDescription: this.title.length > 0,
        ModalCalendar: !!this.date,
        ModalTime: true
      };
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
      this.$store.commit('SET_ADD_EXAM_MODAL_VALUES', {
        [property]: value
      });
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
