<template>
  <div class="exams-overview">
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
        {{ isPast ? 'Was on' : 'On' }} {{ shortDateTimeString(exam.date) }}
      </h2>
    </section>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'ExamsOverview',
  data () {
    return {
      loading: true,
      exam: {}
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
    async getExam () {
      // If its an upcoming exam, we already have the data on it
      if (
        this.$store.getters.getUpcomingExamById(
          this.$route.params.examID
        )
      ) {
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
        request = await this.$http.get(
          `/exams/e/${this.$route.params.examID}`
        );
      } catch (e) {
        this.loading = false;
        this.$router.push('/exams');

        return this.$toasted.error(e.response.data.message);
      }

      this.exam = request.data.exam;
      document.title = `${this.exam.title} | LATE`;
      this.loading = false;
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
