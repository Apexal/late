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

      <div class="content exam-description">
        <blockquote>
          <VueMarkdown
            v-if="exam.description.length > 0"
            :source="exam.description"
            :html="false"
            :emoji="true"
            :anchor-attributes="{target: '_blank'}"
          />
          <i v-else>No description given.</i>
        </blockquote>
      </div>

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
import ExamsModalEdit from '@/components/exams/ExamsModalEdit';

import AssessmentOverviewTitle from '@/components/AssessmentOverviewTitle';
import ExamOverviewStats from '@/components/exams/overview/ExamOverviewStats';
import ExamOverviewActionButtons from '@/components/exams/overview/ExamOverviewActionButtons';
import ExamOverviewTabs from '@/components/exams/overview/ExamOverviewTabs';

export default {
  name: 'ExamsOverview',
  components: {
    AssessmentOverviewTitle,
    VueMarkdown,
    ExamsModalEdit,
    ExamOverviewStats,
    ExamOverviewActionButtons,
    ExamOverviewTabs
  },
  data () {
    return {
      tab: 'schedule',
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
    $route: 'getExam'
  },
  created () {
    this.getExam();
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
    async addComment (newComment) {
      if (!newComment) return;

      this.commentLoading = true;
      let request;
      try {
        request = await this.$http.post(`/exams/e/${this.exam._id}/comments`, {
          comment: newComment
        });
      } catch (e) {
        this.$toasted.error(e.response.data.message);
        this.commentLoading = false;
        return;
      }

      // Calls API and updates state
      if (this.$store.getters.getUpcomingExamById(this.exam._id)) {
        this.$store.commit('UPDATE_UPCOMING_EXAM', request.data.updatedExam);
      } else {
        this.updatedExam(request.data.updatedExam);
      }

      this.commentLoading = false;
    },
    async deleteComment (i) {
      let request;

      this.commentLoading = true;
      try {
        request = await this.$http.delete(
          `/exams/e/${this.exam._id}/comments/${i}`
        );
      } catch (e) {
        this.$toasted.error(e.response.data.message);
        this.commentLoading = false;
        return;
      }

      // Calls API and updates state
      if (this.$store.getters.getUpcomingExamById(this.exam._id)) {
        this.$store.commit('UPDATE_UPCOMING_EXAM', request.data.updatedExam);
      } else {
        this.updatedExam(request.data.updatedExam);
      }

      this.commentLoading = false;
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
