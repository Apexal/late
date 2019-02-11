<template>
  <div class="upcoming">
    <span
      v-if="upcomingAssessments.length === 0"
      class="has-text-grey"
    >
      No upcoming assignments or exams for one week.
    </span>
    <router-link
      v-for="assessment in upcomingAssessments"
      :key="assessment._id"
      class="tag assessment-tag"
      :style="{ backgroundColor: course.color, color: 'white' }"
      :to="`/${assessment.assessmentType}s/${assessment._id}`"
      :title="assessmentLinkTitle(assessment)"
    >
      {{ limitTo(assessment.title, 15) }}
      <span
        v-if="assessment.assessmentType === 'assignment'"
        class="icon"
      >
        <i
          class="fa"
          :class="assessment.completed ? 'fa-check' : 'fa-times'"
        />
      </span>
    </router-link>

    <hr class="small-margin">

    <div class="buttons">
      <button
        class="button is-outlined is-info"
        @click="addAssessment('assignment')"
      >
        <i class="fa fa-clipboard-list" />
        Add Assignment
      </button>
      <button
        class="button is-outlined is-info"
        @click="addAssessment('exam')"
      >
        <i class="fa fa-file-alt" />
        Add Exam
      </button>
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
    limitTo (str, length) {
      if (str.length > length) str = str.substr(0, length) + '...';
      return str;
    },
    assessmentLinkTitle (assessment) {
      if (assessment.assessmentType === 'exam') { return 'On ' + moment(assessment.date).format('M/DD/YY'); } else if (assessment.assessmentType === 'assignment') { return 'Due on ' + moment(assessment.dueDate).format('M/DD/YY'); }
    }
  }
};
</script>

<style lang="scss" scoped>
.assessment-tag:not(:last-of-type) {
  margin-right: 10px;
}

hr.small-margin {
  margin: 12px 0;
}

.buttons {
  button {
    i.fa {
      margin-right: 5px;
    }
  }
}
</style>
