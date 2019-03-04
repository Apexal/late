<template>
  <div class="exams-overview">
    <ExamsModalEdit
      v-if="!isPast"
      :open="editing"
      :initial-exam="exam"
      @toggle-modal="editing = !editing"
      @edit-exam="updatedExam"
      @remove-exam="remove"
    />
    <section
      v-if="loading"
      class="section"
    >
      <h1 class="title has-text-grey">
        Loading Exam...
      </h1>
    </section>
    <section
      v-else
      class="section"
    >
      <AssessmentOverviewTitle
        :assessment-type="'exam'"
        :assessment="exam"
      />

      <ExamOverviewStats :exam="exam" />

      <AssessmentOverviewActionButtons
        :assessment-type="'exam'"
        :assessment="exam"
        :loading="loading"
        :description-expanded="descriptionExpanded"
        @toggle-description="descriptionExpanded = !descriptionExpanded"
        @toggle-editing="toggleEditing"
      />
      <AssessmentOverviewDescription
        v-if="descriptionExpanded"
        :assessment-type="'exam'"
        :assessment="exam"
        :expanded="descriptionExpanded"
        @update-assessment="updatedExam"
      />

      <hr v-else>

      <ExamOverviewTabs
        :tab="tab"
        :exam="exam"
        :loading="loading || commentLoading"
        @set-tab="tabChanged"
        @update-assessment="updatedExam"
      />
    </section>
  </div>
</template>

<script>
import moment from 'moment';
import VueMarkdown from 'vue-markdown';
import ExamsModalEdit from '@/views/components/exams/ExamsModalEdit';

import AssessmentOverviewDescription from '@/views/components/AssessmentOverviewDescription';
import AssessmentOverviewActionButtons from '@/views/components/AssessmentOverviewActionButtons';
import AssessmentOverviewTitle from '@/views/components/AssessmentOverviewTitle';
import ExamOverviewStats from '@/views/components/exams/overview/ExamOverviewStats';
import ExamOverviewTabs from '@/views/components/exams/overview/ExamOverviewTabs';

export default {
  name: 'ExamsOverview',
  components: {
    AssessmentOverviewDescription,
    AssessmentOverviewTitle,
    VueMarkdown,
    ExamsModalEdit,
    ExamOverviewStats,
    AssessmentOverviewActionButtons,
    ExamOverviewTabs
  },
  data () {
    return {
      tab: 'schedule',
      descriptionExpanded: true,
      commentLoading: false,
      loading: true,
      isUpcoming: false,
      exam: {},
      editing: false
    };
  },
  computed: {
    now () {
      return this.$store.state.now;
    },
    course () {
      return this.$store.getters.getCourseFromCRN(this.exam.courseCRN);
    },
    isPast () {
      return this.exam.passed;
    }
  },
  watch: {
    $route: 'getExam',
    exam (newExam) {
      document.title = `${newExam.title} | LATE`;
    },
    descriptionExpanded (newDescriptionExpanded) {
      localStorage.setItem(
        'assessmentOverviewDescriptionExpanded',
        newDescriptionExpanded
      );
    }
  },
  created () {
    this.getExam();
  },
  mounted () {
    if (localStorage.getItem('assessmentOverviewDescriptionExpanded')) {
      try {
        this.descriptionExpanded = JSON.parse(
          localStorage.getItem('assessmentOverviewDescriptionExpanded')
        );
      } catch (e) {
        localStorage.removeItem('assessmentOverviewDescriptionExpanded');
      }
    }
  },
  methods: {
    tabChanged (newTab) {
      this.tab = newTab;
    },
    toggleEditing () {
      this.editing = !this.editing;
    },
    updatedExam (newExam) {
      this.exam = newExam;
    },
    async getExam () {
      // If its an upcoming exam, we already have the data on it
      if (this.$store.getters.getUpcomingExamById(this.$route.params.examID)) {
        this.exam = this.$store.getters.getUpcomingExamById(
          this.$route.params.examID
        );
        this.loading = false;
        this.isUpcoming = true;
        document.title = `${this.exam.title} | LATE`;

        if (this.passed) this.tab = 'comments';

        return;
      }

      this.loading = true;
      this.isUpcoming = false;

      this.tab = 'comments';

      let request;
      try {
        request = await this.$http.get(`/exams/e/${this.$route.params.examID}`);
      } catch (e) {
        this.loading = false;
        this.$router.push('/exams');

        return this.$toasted.error(e.response.data.message);
      }

      this.exam = request.data.exam;
      document.title = `${this.exam.title} | LATE`;
      this.loading = false;
    },
    async remove () {
      // Confirm user wants to remove exam
      if (
        !confirm(`Are you sure you want to remove exam ${this.exam.title}?`)
      ) {
        return;
      }

      const examTitle = this.exam.title;
      const examID = this.exam._id;

      this.$router.push('/exams');

      // This handles the API call and state update
      if (this.isUpcoming) {
        await this.$store.dispatch('REMOVE_UPCOMING_EXAM', examID);
      } else {
        await this.$http.delete(`/exams/e/${examID}`);
      }

      // Notify user of success
      this.$toasted.success(`Successfully removed exam '${examTitle}'.`, {
        icon: 'times',
        action: {
          text: 'Undo'
        }
      });
    },
    shortDateTimeString: date =>
      moment(date).format('dddd, MMM Do YYYY [@] h:mma'),
    toFullDateTimeString: date =>
      moment(date).format('dddd, MMMM Do YYYY, h:mma'),
    fromNow (date) {
      return moment(date).from(this.now);
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
