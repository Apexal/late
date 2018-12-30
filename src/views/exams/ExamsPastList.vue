<template>
  <div class="past-exams">
    <h2 class="subtitle">
      Month of {{ monthOf }}
    </h2>

    <table class="table is-full-width">
      <thead>
        <tr>
          <th>When</th>
          <th class="is-hidden-mobile">
            Course
          </th>
          <th>Title</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="ex in filtered"
          :key="ex._id"
        >
          <td>{{ toDateShorterString(ex.date) }}</td>
          <td>{{ course(ex.courseCRN).longname }}</td>
          <td>{{ ex.title }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'ExamsPastList',
  props: {
    filter: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      loading: true,
      startDate:
        this.$route.query.start ||
        moment()
          .startOf('month')
          .format('YYYY-MM-DD'),
      endDate: this.$route.query.end || moment().format('YYYY-MM-DD'),
      currentAssignments: []
    };
  },
  computed: {
    startMoment () {
      return moment(this.startDate, 'YYYY-MM-DD', true);
    },
    endMoment () {
      return moment(this.endDate, 'YYYY-MM-DD', true);
    },
    monthOf () {
      return this.startMoment.format('MMMM YYYY');
    },
    filtered () {
      return this.currentExams.filter(ex => {
        return !this.filter.includes(ex.courseCRN);
      });
    }
  },
  created () {
    this.getExams();
  },
  methods: {
    course (ex) {
      return this.$store.getters.getCourseFromCRN(ex.courseCRN);
    },
    async getExams () {
      this.loading = true;
      let request;

      try {
        request = await this.$http.get('/exams', {
          params: { start: this.startDate, end: this.endDate }
        });
      } catch (e) {
        this.loading = false;
        this.currentExams = [];
        return this.$toasted.error(e.response.data.message);
      }

      this.currentExams = request.data.exams;
      this.loading = false;
    },
    toDateShorterString: date => moment(date).format('dddd [the] Do')
  }
};
</script>

<style lang="scss" scoped>
</style>
