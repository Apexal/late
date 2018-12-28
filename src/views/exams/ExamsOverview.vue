<template>
  <div class="exams-overview">
    <ExamsModalEdit
      v-if="!isPast"
      :open="editing"
      :initial-exam="exam"
      @toggle-modal="editing = !editing"
      @edit-exam="editedExam"
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
      <div class="is-clearfix">
        <ExamOverviewActionButtons
          :exam="exam"
          :loading="loading"
          @toggle-editing="toggleEditing"
        />
        <h2 class="subtitle">
          {{ course.longname }}
          <span class="has-text-grey">
            {{ isPast ? 'Past ': '' }}Exam
          </span>
        </h2>
        <h1 class="title">
          {{ exam.title }}
        </h1>
        <h2 class="subtitle has-text-grey due-title">
          {{ isPast ? 'Was on' : 'On' }}
          <b>{{ shortDateTimeString(exam.date) }}</b>
        </h2>
      </div>

      <div class="content exam-description">
        <blockquote>
          <VueMarkdown
            v-if="exam.description.length > 0"
            :source="exam.description"
            :html="false"
            :emoji="true"
            :anchor-attributes="{target: '_blank'}"
          />
          <i v-else>
            No description given.
          </i>
        </blockquote>
      </div>
    </section>
  </div>
</template>

<script>
import moment from 'moment';
import VueMarkdown from 'vue-markdown';
import ExamsModalEdit from '@/components/exams/ExamsModalEdit';

import ExamOverviewActionButtons from '@/components/exams/overview/ExamOverviewActionButtons';

export default {
  name: 'ExamsOverview',
  components: { VueMarkdown, ExamsModalEdit, ExamOverviewActionButtons },
  data () {
    return {
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
    toggleEditing () {
      this.editing = !this.editing;
    },
    editedExam (newExam) {
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
        return;
      }

      this.loading = true;
      this.isUpcoming = false;

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
      alert('Delete this exam!');
    },
    shortDateTimeString: dueDate =>
      moment(dueDate).format('dddd, MMM Do YYYY [@] h:mma'),
    toFullDateTimeString: dueDate =>
      moment(dueDate).format('dddd, MMMM Do YYYY, h:mma'),
    fromNow (date) {
      return moment(date).from(this.now);
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
