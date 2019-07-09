export default {
  computed: {
    isOwner () {
      return (
        this.assessment._student &&
        (this.assessment._student === this.user._id ||
        this.assessment._student._id === this.user._id)
      );
    },
    assessmentType () {
      return this.assessment.assessmentType;
    },
    capitalizedAssessmentType () {
      return this.assessmentType === 'assignment' ? 'Assignment' : 'Exam';
    },
    course () {
      return this.$store.getters.getCourseFromCRN(this.assessment.courseCRN);
    }
  }
};
