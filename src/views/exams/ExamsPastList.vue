<template>
  <div class="past-exams">
    <div class="is-flex">
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

      <h2
        style="flex: 1"
        class="subtitle has-text-centered"
      >
        Month of {{ monthOf }}
      </h2>

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

    <ExamsTable
      v-if="filtered.length > 0"
      :exams="filtered"
    />
    <p
      v-else
      class="has-text-grey has-text-centered"
    >
      No exams
      <i
        v-if="filter.length > 0"
        style="font-style:inherit"
      >matching your filters.</i>
      <i
        v-if="filter.length <= 0"
        style="font-style:inherit"
      >this month!</i>
    </p>
  </div>
</template>

<script>
import moment from 'moment';
import ExamsTable from '@/views/components/exams/ExamsTable.vue';

export default {
  name: 'ExamsPastList',
  components: { ExamsTable },
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
        .isSameOrBefore(moment(), 'month');
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

      this.currentExams = request.data.exams.filter(e => e.passed); // Only get passed exams
      this.loading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
