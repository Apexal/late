<template>
  <i
    class="course-assessment-dot"
    :class="classes"
    :title="title"
    :style="style"
    @click.prevent="$store.commit('OPEN_COURSE_MODAL', course)"
  />
</template>

<script>
export default {
  name: 'CourseAssessmentDot',
  props: {
    assessment: {
      type: Object,
      default: () => {}
    },
    course: {
      type: Object,
      required: true
    }
  },
  computed: {
    isForAssessment () {
      return Object.keys(this.assessment || {}).length > 0;
    },
    classes () {
      if (this.isForAssessment) {
        return ['assessment', 'fas', this.assessment.assessmentType === 'assignment' ? 'fa-clipboard-check' : 'fa-exclamation-triangle'];
      }

      return ['dot', 'course'];
    },
    style () {
      return {
        [this.isForAssessment ? 'color' : 'background-color']: this.course.color
      };
    },
    title () {
      if (this.isForAssessment) {
        return this.course.longname + ' ' + this.assessment.assessmentType.charAt(0).toUpperCase() + this.assessment.assessmentType.slice(1);
      }

      return this.course.longname;
    }
  }
};
</script>

<style lang="scss" scoped>
.course-assessment-dot {
  cursor: pointer;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 100%;
  cursor: pointer;
  background-color: black;
  display: inline-block;
  margin-right: 5px;
}

</style>
