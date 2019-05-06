<template>
  <nav class="box level assignment-stats has-background-grey-darker has-text-white">
    <div class="level-item has-text-centered">
      <div>
        <p
          class="heading"
          title="The importance of this assignment."
        >
          Priority
        </p>
        <p
          class="subtitle priority"
          :class="{ 'is-italic': assignment.priority === 1 }"
          :style="{ 'font-weight': fontWeight }"
        >
          <i
            v-show="assignment.priority > 1"
            class="fas fa-minus has-text-grey decrease-priority"
            :title="'Decrease priority to ' + priorityStrings[assignment.priority - 1]"
            @click="changePriority(-1)"
          />
          {{ priorityString }}
          <i
            v-show="assignment.priority < 5"
            class="fas fa-plus has-text-grey increase-priority"
            :title="'Increase priority to ' + priorityStrings[assignment.priority + 1]"
            @click="changePriority(1)"
          />
        </p>
      </div>
    </div>

    <div class="level-item has-text-centered">
      <div>
        <p
          class="heading"
          title="When is this assignment due?"
        >
          {{ assignment.passed ? 'Was Due' : 'Due' }}
        </p>
        <form
          v-if="editingDueDate"
          class="control due-date"
          @submit.prevent="updateDueDate"
        >
          <input
            v-model="tempDueDateString"
            :min="minDueDate"
            :max="maxDueDate"
            type="date"
          >
          <input
            v-model="tempDueTimeString"
            type="time"
          >
          <i
            class="fas fa-check has-text-success save-due-date"
            title="Save new due date and time."
            @click="updateDueDate"
          />
        </form>
        <p
          v-else
          class="subtitle due-date tooltip is-tooltip-bottom"
          :data-tooltip="timeLeft"
        >
          {{ shortDueDateString }}
          <i
            class="fas fa-pencil-alt has-text-grey edit-due-date"
            title="Edit due date and time."
            @click="editingDueDate = true"
          />
        </p>
      </div>
    </div>
    <div
      v-if="assignment.completed"
      class="level-item has-text-centered"
    >
      <div>
        <p class="heading">
          Completed
        </p>
        <p
          class="subtitle tooltip is-tooltip-bottom"
          :data-tooltip="fromNow(assignment.completedAt)"
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
          {{ assignment.fullyScheduled ? 'Scheduled Work Left' : 'Work Schedule' }}
        </p>
        <p
          v-if="assignment.fullyScheduled"
          class="subtitle"
        >
          {{ assignment.scheduledTimeRemaing }}
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
  name: 'AssignmentOverviewStats',
  props: {
    assignment: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      loading: false,
      editingDueDate: false,
      tempDueDateString: '',
      tempDueTimeString: ''
    };
  },
  computed: {
    currentTerm () {
      return this.$store.getters.currentTerm;
    },
    minDueDate () {
      return moment(this.currentTerm.start).format('YYYY-MM-DD');
    },
    maxDueDate () {
      return moment(this.currentTerm.end).format('YYYY-MM-DD');
    },
    fontWeight () {
      return (
        {
          1: 300,
          2: 300,
          3: 'normal',
          4: 500,
          5: 700
        }[this.assignment.priority] || 600
      );
    },
    priorityStrings () {
      return {
        1: 'Optional',
        2: 'Low',
        3: 'Normal',
        4: 'High',
        5: 'Important'
      };
    },
    priorityString () {
      return this.priorityStrings[this.assignment.priority] || 'Unknown';
    },
    completedAt () {
      return moment(this.assignment.updatedAt).format('M/DD/YY h:mma');
    },
    timeLeft () {
      const diff = moment.duration(
        moment(this.assignment.dueDate).diff(this.now)
      );
      return `${diff.days()}d ${diff.hours()}h ${diff.minutes()}m`;
    },
    inputFormatDueDate () {
      return moment(this.assignment.dueDate).format('YYYY-MM-DD');
    },
    inputFormatDueTime () {
      return moment(this.assignment.dueDate).format('HH:mm');
    },
    shortDueDateString () {
      return this.shortDateTimeString(this.assignment.dueDate);
    }
  },
  watch: {
    editingDueDate () {
      this.tempDueDateString = this.inputFormatDueDate;
      this.tempDueTimeString = this.inputFormatDueTime;
    }
  },
  methods: {
    async updateDueDate () {
      if (this.loading) return;

      const newDueDate = moment(
        this.tempDueDateString + ' ' + this.tempDueTimeString,
        'YYYY-MM-DD HH:mm',
        true
      );
      if (moment(this.assignment.dueDate).isSame(newDueDate)) {
        this.editingDueDate = false;
        return;
      }
      if (newDueDate.isBefore(moment())) {
        if (!confirm('Move this assignment to the past?')) return;
      }
      await this.updateAssignment({ dueDate: newDueDate.toDate() });

      this.editingDueDate = false;
    },
    async changePriority (change) {
      if (this.loading) return;

      if (
        this.assignment.priority + change < 1 ||
        this.assignment.priority + change > 5
      ) {
        return;
      }
      this.updateAssignment({ priority: this.assignment.priority + change });
    },
    async updateAssignment (updates) {
      this.loading = true;
      let request;
      try {
        request = await this.$http.patch(
          `/assignments/a/${this.assignment._id}`,
          updates
        );
      } catch (e) {
        this.$toasted.error(e.response.data.message);
        return;
      }

      // Calls API and updates state
      if (
        // eslint-disable-next-line
        this.$store.getters.getUpcomingAssessmentById(this.assignment._id)
      ) {
        this.$store.dispatch(
          'UPDATE_UPCOMING_ASSESSMENT',
          request.data.updatedAssignment
        );
      } else {
        this.$emit('update-assessment', request.data.updatedAssignment);
      }
      this.loading = false;
      return request.data.updatedAssignment;
    },
    shortDateTimeString: dueDate =>
      moment(dueDate).format('ddd, MMM Do YY [@] h:mma'),
    toFullDateTimeString: dueDate =>
      moment(dueDate).format('dddd, MMMM Do YYYY, h:mma'),
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

.level.assignment-stats {

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
  .edit-due-date,
  .save-due-date {
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s;
  }
  .save-due-date {
    margin-left: 5px;
  }
  .priority:hover {
    .decrease-priority,
    .increase-priority {
      opacity: 1;
    }
  }

  .due-date:hover {
    .edit-due-date,
    .save-due-date {
      opacity: 1;
    }
  }
}
</style>
