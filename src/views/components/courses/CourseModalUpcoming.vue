<template>
  <div class="upcoming">
    <p
      v-if="upcomingAssessments.length === 0"
      class="has-text-grey has-text-centered"
    >
      No upcoming assignments or exams for one week
    </p>
    <div
      v-else
      class="columns is-multiline"
    >
      <div
        v-for="assessment in upcomingAssessments"
        :key="assessment._id"
        class="column is-half"
      >
        <router-link
          class="box assessment-box is-flex"
          :to="{ name: assessment.assessmentType + '-overview', params: { [assessment.assessmentType + 'ID']: assessment._id }}"
          :title="assessmentLinkTitle(assessment)"
        >
          <span style="flex: 1">{{ assessment.title }}</span>
          <span class="icon">
            <i
              v-if="assessment.assessmentType === 'assignment'"
              class="fa assessment-completion-icon"
              :class="assessment.completed ? 'fa-check' : 'fa-times'"
            />
            <i
              v-else
              class="fa fa-exclamation-triangle"
            />
          </span>
        </router-link>
      </div>
    </div>

    <hr class="small-margin">

    <div class="buttons">
      <b-button
        type="is-info"
        outlined
        @click="$emit('add-assessment', 'assignment')"
      >
        <i class="fa fa-clipboard-list" />
        Add Assignment
      </b-button>
      <b-button
        type="is-info"
        outlined
        @click="$emit('add-assessment', 'exam')"
      >
        <i class="fa fa-exclamation-triangle" />
        Add Exam
      </b-button>
    </div>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'CourseModalUpcoming',
  props: {
    course: {
      type: Object,
      required: true
    },
    upcomingAssessments: {
      type: Array,
      required: true
    }
  },
  methods: {
    assessmentLinkTitle (assessment) {
      if (assessment.assessmentType === 'exam') {
        return 'Exam on ' + this.shortDateFormat(assessment.date);
      } else if (assessment.assessmentType === 'assignment') {
        return 'Assignment due ' + this.shortDateFormat(assessment.dueDate);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.upcoming {
  padding-top: 12px;

  .column.is-half {
    padding: 8px;
  }

  .assessment-box {
    padding: 10px;
    span {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .assessment-completion-icon {
      color: red;
      &.fa-check {
        color: green;
      }
    }
  }

  hr.small-margin {
    margin: 12px 0;
  }

  .buttons {
    justify-content: flex-end;
    button {
      i.fa {
        margin-right: 5px;
      }
    }
  }
}
</style>
