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
    <div
      v-if="assessmentType === 'assignment'"
      class="has-text-centered-mobile"
    >
      <button
        :title="`This assignment is ${assessment.completed ? 'completed' : 'incomplete'}!`"
        class="button is-success toggle-complete"
        :class="{ 'is-outlined': !assessment.completed }"
        @click="$emit('toggle-completed')"
      >
        <i
          class="fa-check-square"
          :class="[assessment.completed ? 'fas' : 'far']"
        />
        {{ assessment.completed ? 'Completed' : 'Incomplete' }}
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AssessmentOverviewTitle',
  props: {
    assessment: {
      type: Object,
      required: true
    }
  },
  computed: {
    assessmentType () {
      return this.assessment.assessmentType;
    },
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
  i {
    margin-right: 5px;
  }
  @media only screen and (max-width: 768px) {
    margin-top: 5px;
  }
}

.course-tag {
  cursor: pointer;
  color: white;

  .course-longname {
    margin-right: 5px;
  }

  margin-right: 10px;
}
</style>
