<template>
  <div class="past-exams">
    <h2 class="subtitle">
      Month of {{ monthOf }}
    </h2>

    <table class="exam-table table is-full-width">
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
          <td
            class="tooltip"
            :data-tooltip="fromNow(ex.date)"
          >
            {{ toDateShorterString(ex.date) }}
          </td>
          <td
            class="exam-course"
            @click="$store.commit('OPEN_COURSE_MODAL', course(ex))"
          >
            <span
              class="dot"
              :title="course(ex).longname"
              :style="'background-color: ' + course(ex).color"
            />
            {{ course(ex).longname }}
          </td>
          <router-link
            tag="td"
            class="exam-link"
            :title="ex.description.substring(0, 500)"
            :to="{ name: 'exams-overview', params: { examID: ex._id }}"
          >
            {{ ex.title }}
          </router-link>
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
      startDate: moment().startOf('month'),
      currentExams: []
    };
  },
  computed: {
    now () {
      return this.$store.state.now;
    },
    startMoment () {
      return moment(this.startDate);
    },
    endMoment () {
      return moment(this.startDate).endOf('month');
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
          params: {
            start: this.startMoment.format('YYYY-MM-DD'),
            end: this.endMoment.format('YYYY-MM-DD')
          }
        });
      } catch (e) {
        this.loading = false;
        this.currentExams = [];
        return this.$toasted.error(e.response.data.message);
      }

      this.currentExams = request.data.exams;
      this.loading = false;
    },
    fromNow (date) {
      return moment(date).from(this.now);
    },
    toDateShorterString: date => moment(date).format('dddd [the] Do')
  }
};
</script>

<style lang="scss" scoped>
.exam-course {
  font-weight: 600;
  cursor: pointer;
}
.exam-link {
  color: inherit;
  cursor: pointer;
}
</style>
