<template>
  <div class="assessment panel-block">
    <span class="is-full-width">
      <span
        v-if="assessmentType === 'assignment'"
        class="icon toggle-assignment"
        @click="$emit('toggle-assignment', assessment._id)"
      >
        <span
          :class="[ assessment.completed ? 'fas fa-check-circle' : 'far fa-circle' ]"
          :title="toggleAssignmentTitle"
          :style="{ 'color': course.color }"
        />
      </span>
      <router-link
        class="assessment-link"
        :title="(assessment.priority === 1 ? '(OPTIONAL) ' : '') + assessment.description.substring(0, 500)"
        :to="linkToParams"
        :class="{ 'priority': assessment.priority > 3, 'has-text-grey is-italic': assessment.priority === 1 }"
      >
        <span
          v-if="assessmentType === 'exam'"
          :style="{ 'color': course.color }"
          class="icon exam-icon"
          :title="`${course.longname} Exam`"
        >
          <i class="fas fa-exclamation-triangle" />
        </span>
        <b class="course-title is-hidden-tablet">{{ course.longname }}</b>
        {{ assessment.title }}
      </router-link>
      <span
        class="is-tooltip-left icon has-text-danger is-pulled-right"
        :class="{ 'tooltip': assessmentType === 'exam' || (assessmentType === 'assignment' && !assessment.completed) }"
        :data-tooltip="scheduleWarningTitle"
      >
        <i
          :style="{ opacity: assessmentTimeWarningOpacity }"
          class="far fa-clock"
        />
      </span>
      <small
        v-if="groupBy === 'date'"
        class="is-pulled-right has-text-grey"
      >{{ toTimeString }}</small>
      <small
        v-else
        class="is-pulled-right tooltip is-tooltip-left has-text-grey"
        :data-tooltip="toDateShortString + ' ' + toTimeString"
      >{{ fromNow }}</small>
    </span>
  </div>
</template>

<script>
import moment from 'moment';
export default {
  name: 'AssessmentsUpcomingPanelBlock',
  props: {
    groupBy: {
      type: String,
      required: true
    },
    assessment: {
      type: Object,
      required: true
    }
  },
  computed: {
    assessmentType () {
      return this.assessment.assessmentType;
    },
    now () {
      return this.$store.state.now;
    },
    course () {
      return this.$store.getters.getCourseFromCRN(this.assessment.courseCRN);
    },
    toggleAssignmentTitle () {
      return (
        this.course.longname +
        ' Assignment' +
        (this.assessment.completedAt
          ? ` | Completed ${moment(this.assessment.completedAt).format(
            'M/DD/YY h:mma'
          )}`
          : '')
      );
    },
    scheduleWarningTitle () {
      return `${this.assessment.scheduledTime}/${this.assessment.timeEstimate *
        60} min scheduled`;
    },
    assessmentDate () {
      return this.assessmentType === 'assignment'
        ? this.assessment.dueDate
        : this.assessment.date;
    },
    toDateShortString () {
      if (moment(this.assessmentDate).isSame(moment(), 'day')) {
        return 'Today';
      }
      if (moment(this.assessmentDate).isSame(moment().add(1, 'day'), 'day')) {
        return 'Tomorrow';
      }
      return moment(this.assessmentDate).format('dddd [the] Do');
    },
    toTimeString () {
      return moment(this.assessmentDate).format('h:mma');
    },
    fromNow () {
      return moment(this.assessmentDate).fromNow();
    },
    daysAway () {
      return moment(this.assessmentDate).diff(
        moment(this.now).startOf('day'),
        'days'
      );
    },
    assessmentTimeWarningOpacity () {
      if (this.assessmentType === 'assignment' && this.assessment.completed) {
        return 0;
      }
      if (this.assessment.scheduledTime === 0) return 1;
      if (this.assessment.timeEstimate === 0) return 0;
      if (this.assessment.timeEstimate === this.assessment.scheduledTime) {
        return 0;
      }

      return (
        1 - this.assessment.scheduledTime / (this.assessment.timeEstimate * 60)
      );
    },
    linkToParams () {
      return {
        name: this.assessmentType + '-overview',
        params: { [this.assessmentType + 'ID']: this.assessment._id }
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.assessment {
  padding-right: 5px;
  padding-left: 5px;
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);

  .assessment-link {
    color: inherit;
  }
  .is-completed {
    text-decoration: line-through;
  }

  .toggle-assignment {
    cursor: pointer;
  }

  .priority {
    font-weight: 500;
  }
}
</style>
