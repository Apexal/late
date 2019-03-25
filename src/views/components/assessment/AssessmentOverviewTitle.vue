<template>
  <div class="assessment-overview-title is-flex-tablet">
    <div class="has-text-centered-mobile">
      <span
        class="tag is-medium course-tag"
        :style="{ 'background-color': course.color }"
        @click="$store.commit('OPEN_COURSE_MODAL', course)"
      >
        <b class="course-longname">{{ course.longname }}</b>
        {{ assessment.passed ? 'Past ': '' }}{{ assessmentType === 'assignment' && assessment.isRecurring ? 'Recurring ' : '' }}{{ capitalizedAssessmentType }}
      </span>
    </div>
    <h1
      class="title assessment-title has-text-centered-mobile"
      style="flex: 1"
    >
      {{ assessment.title }}
    </h1>
    <span
      v-if="assessmentType === 'assignment'"
      :title="`This assignment is ${assessment.completed ? 'completed' : 'incomplete'}!`"
      :style="{ 'color': course.color }"
      class="icon toggle-complete"
      @click="$emit('toggle-completed')"
    >
      <i
        class="fa"
        :class="[assessment.completed ? 'fa-check-circle' : 'fa-times-circle']"
      />
    </span>
  </div>
</template>

<script>
export default {
  name: 'AssessmentOverviewTitle',
  props: {
    assessmentType: {
      type: String,
      required: true
    },
    assessment: {
      type: Object,
      required: true
    }
  },
  computed: {
    course () {
      return this.$store.getters.getCourseFromCRN(this.assessment.courseCRN);
    },
    capitalizedAssessmentType () {
      return this.assessmentType === 'assignment' ? 'Assignment' : 'Exam';
    }
  }
};
</script>

<style lang="scss" scoped>
.assessment-overview-title {
  align-items: center;
}

.assessment-title {
  margin-bottom: 0;
}

.toggle-complete {
  cursor: pointer;
  font-size: 2em;
}

.course-tag {
  cursor: pointer;
  color: white;

  .course-longname {
    margin-right: 5px;
  }

  margin-right: 10px;
  // @media only screen and (max-width: 768px) {
  //   margin-top: 10px;
  // }
}
</style>
