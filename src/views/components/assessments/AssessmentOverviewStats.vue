<template>
  <nav class="box level assessment-stats has-background-grey-darker has-text-white">
    <div class="level-item has-text-centered">
      <div>
        <p
          class="heading"
          title="The importance of this assessment."
        >
          Priority
        </p>
        <p
          class="subtitle priority"
          :class="{ 'is-italic': assessment.priority === 1 }"
          :style="{ 'font-weight': fontWeight }"
        >
          <i
            v-show="assessment.priority - 1 in priorityStrings"
            class="fas fa-minus has-text-grey decrease-priority"
            :title="'Decrease priority to ' + priorityStrings[assessment.priority - 1]"
            @click="changePriority(-1)"
          />
          {{ priorityString }}
          <i
            v-show="assessment.priority + 1 in priorityStrings"
            class="fas fa-plus has-text-grey increase-priority"
            :title="'Increase priority to ' + priorityStrings[assessment.priority + 1]"
            @click="changePriority(1)"
          />
        </p>
      </div>
    </div>

    <div class="level-item has-text-centered">
      <div>
        <p
          class="heading"
          title="When is this assessment due?"
        >
          {{ (assessment.passed ? 'Was ': '') + (assessmentType === 'assignment' ? 'Due' : 'On') }}
        </p>
        <form
          v-if="editingDate"
          class="control date"
          @submit.prevent="updateDate"
        >
          <input
            v-model="tempDateString"
            :min="minDate"
            :max="maxDate"
            type="date"
          >
          <input
            v-model="tempTimeString"
            type="time"
          >
          <i
            class="fas fa-check has-text-success save-date"
            title="Save new date and time."
            @click="updateDate"
          />
        </form>
        <p
          v-else
          class="subtitle date tooltip is-tooltip-bottom"
          :data-tooltip="timeLeft"
        >
          {{ shortDateString }}
          <i
            class="fas fa-pencil-alt has-text-grey edit-date"
            title="Edit date and time."
            @click="editingDate = true"
          />
        </p>
      </div>
    </div>
    <div
      v-if="assessmentType === 'exam' && assessment.completed"
      class="level-item has-text-centered"
    >
      <div>
        <p class="heading">
          Completed
        </p>
        <p
          class="subtitle tooltip is-tooltip-bottom"
          :data-tooltip="fromNow(assessment.completedAt)"
        >
          {{ completedAt }}
        </p>
      </div>
    </div>

    <div
      v-else
      class="level-item has-text-centered"
    >
      <div>
        <p class="heading">
          {{ assessment.fullyScheduled ? 'Scheduled ' + assessmentActionTerm + ' Left' : assessmentActionTerm + ' Schedule' }}
        </p>
        <p
          v-if="assessment.fullyScheduled"
          class="subtitle"
        >
          {{ assessment.scheduledTimeRemaing }}
          <span class="has-text-grey">min</span>
        </p>
        <p v-else>
          <span
            class="tag is-danger not-scheduled-tag"
            @click="$emit('not-fully-scheduled-click')"
          >Not fully scheduled!</span>
        </p>
      </div>
    </div>
  </nav>
</template>

<script>
import moment from 'moment';

export default {
  name: 'AssessmentOverviewStats',
  props: {
    assessment: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      loading: false,
      editingDate: false,
      tempDateString: '',
      tempTimeString: ''
    };
  },
  computed: {
    course () {
      return this.$store.getters.getCourseFromCRN(this.assessment.courseCRN);
    },
    assessmentType () {
      return this.assessment.assessmentType;
    },
    assessmentActionTerm () {
      return this.assessmentType === 'assignment' ? 'Work' : 'Study';
    },
    currentTerm () {
      return this.$store.getters.currentTerm;
    },
    minDate () {
      return moment(this.course.startDate).format('YYYY-MM-DD');
    },
    maxDate () {
      return moment(this.course.endDate).format('YYYY-MM-DD');
    },
    fontWeight () {
      return (
        {
          1: 300,
          2: 300,
          3: 'normal',
          4: 500,
          5: 700
        }[this.assessment.priority] || 600
      );
    },
    priorityStrings () {
      if (this.assessmentType === 'assignment') {
        return {
          1: 'Optional',
          2: 'Low',
          3: 'Normal',
          4: 'High',
          5: 'Important'
        };
      } else {
        return {
          1: 'Low',
          2: 'Normal',
          3: 'High'
        };
      }
    },
    priorityString () {
      return this.priorityStrings[this.assessment.priority] || 'Unknown';
    },
    completedAt () {
      return moment(this.assessment.updatedAt).format('M/DD/YY h:mma');
    },
    timeLeft () {
      const diff = moment.duration(
        moment(this.assessment.date).diff(this.now)
      );
      return `${diff.days()}d ${diff.hours()}h ${diff.minutes()}m`;
    },
    inputFormatDate () {
      return moment(this.assessment.date).format('YYYY-MM-DD');
    },
    inputFormatTime () {
      return moment(this.assessment.date).format('HH:mm');
    },
    shortDateString () {
      return this.shortDateTimeString(this.assessment.date);
    }
  },
  watch: {
    editingDate () {
      this.tempDateString = this.inputFormatDate;
      this.tempTimeString = this.inputFormatTime;
    }
  },
  methods: {
    async updateDate () {
      if (this.loading) return;

      const newDate = moment(
        this.tempDateString + ' ' + this.tempTimeString,
        'YYYY-MM-DD HH:mm',
        true
      );
      if (moment(this.assessment.date).isSame(newDate)) {
        this.editingDate = false;
        return;
      }

      await this.updateAssessment({ [ this.assessmentType === 'assignment' ? 'dueDate' : 'date' ]: newDate.toDate() });

      this.$toast.open({
        message: 'Updated ' + (this.assessmentType === 'assignment' ? 'due date' : 'date') + '!',
        type: 'is-success'
      });

      this.editingDate = false;
    },
    async changePriority (change) {
      if (this.loading) return;

      if (
        this.assessment.priority + change < 1 ||
        this.assessment.priority + change > 5
      ) {
        return;
      }
      await this.updateAssessment({ priority: this.assessment.priority + change });
      this.$toast.open({
        message: 'Updated priority!',
        type: 'is-success'
      });
    },
    async updateAssessment (updates) {
      this.loading = true;

      let updatedAssessment;
      try {
        updatedAssessment = await this.$store.dispatch('UPDATE_ASSESSMENT', Object.assign(this.assessment, updates));
      } catch (e) {
        this.loading = false;
        this.$toast.open({
          message: e.response.data.message,
          type: 'is-danger'
        });
        return;
      }

      this.$emit('updated-assessment', updatedAssessment);

      this.loading = false;
      return updatedAssessment;
    },
    shortDateTimeString: date =>
      moment(date).format('ddd, MMM Do YY [@] h:mma'),
    toFullDateTimeString: date =>
      moment(date).format('dddd, MMMM Do YYYY, h:mma'),
    fromNow (date) {
      return moment(date).from(this.now);
    }
  }
};
</script>

<style lang="scss" scoped>
.not-scheduled-tag {
  cursor: pointer;
}

.level.assessment-stats {

  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  margin-top: 20px;
  margin-bottom: 0;
  padding: 5px;

  .level-item .subtitle {
    color: white;
  }

  .decrease-priority,
  .increase-priority,
  .edit-date,
  .save-date {
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s;
  }
  .save-date {
    margin-left: 5px;
  }
  .priority:hover {
    .decrease-priority,
    .increase-priority {
      opacity: 1;
    }
  }

  .date:hover {
    .edit-date,
    .save-date {
      opacity: 1;
    }
  }
}
</style>
