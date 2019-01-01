<template>
  <div class="past-exams">
    <div class="columns">
      <div class="column is-narrow">
        <button
          class="button"
          :disabled="!canGoPrev"
          :class="{ 'is-loading': loading }"
          @click="prevMonth"
        >
          <span class="icon">
            <i class="fas fa-chevron-left" />
          </span>
        </button>
      </div>

      <div class="column">
        <h2 class="subtitle has-text-centered">
          Month of {{ monthOf }}
        </h2>
      </div>

      <div class="column is-narrow">
        <button
          class="button"
          :disabled="!canGoNext"
          :class="{ 'is-loading': loading }"
          @click="nextMonth"
        >
          <span class="icon">
            <i class="fas fa-chevron-right" />
          </span>
        </button>
      </div>
    </div>

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
            class="exam-course is-hidden-mobile"
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
            <span
              class="dot is-hidden-tablet"
              :title="course(ex).longname"
              :style="'background-color: ' + course(ex).color"
              @click.prevent="$store.commit('OPEN_COURSE_MODAL', course(ex))"
            />
            {{ ex.title }}
          </router-link>
        </tr>
      </tbody>
    </table>
    <p
      v-if="filtered.length === 0"
      class="has-text-grey has-text-centered"
    >
      No tests this month recorded!
    </p>
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
      startDate: moment()
        .startOf('month')
        .toDate(),
      currentExams: []
    };
  },
  computed: {
    currentTerm () {
      return this.$store.getters.currentTerm;
    },
    now () {
      return this.$store.state.now;
    },
    startMoment () {
      return moment(this.startDate);
    },
    endMoment () {
      return moment(this.startDate).endOf('month');
    },
    canGoPrev () {
      return moment(this.startMoment)
        .subtract(1, 'month')
        .isSameOrAfter(this.currentTerm.start, 'month');
    },
    canGoNext () {
      return moment(this.startMoment)
        .add(1, 'month')
        .isSameOrBefore(this.currentTerm.end, 'month');
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
  watch: {
    startDate () {
      this.getExams();
    }
  },
  created () {
    this.getExams();
  },
  methods: {
    course (ex) {
      return this.$store.getters.getCourseFromCRN(ex.courseCRN);
    },
    prevMonth () {
      this.startDate = moment(this.startDate)
        .subtract(1, 'month')
        .toDate();
    },
    nextMonth () {
      this.startDate = moment(this.startDate)
        .add(1, 'month')
        .toDate();
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
