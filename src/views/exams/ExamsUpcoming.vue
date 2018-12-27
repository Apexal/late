<template>
  <div class="exams-upcoming">
    <p
      v-if="filtered.length === 0"
      class="has-text-centered has-text-grey"
    >
      No upcoming exams!
    </p>
    <div
      v-else
      class="columns is-multiline"
    >
      <div
        v-for="ex in filtered"
        :key="ex._id"
        class="column is-half"
      >
        <div class="box upcoming-exam">
          <router-link
            tag="h2"
            :to="{ name: 'exams-overview', params: { examID: ex._id }}"
            class="exam-title subtitle"
          >
            <b>{{ course(ex).longname }}</b>
            {{ ex.title }}
            <span
              v-if="ex.priority >= 2"
              class="is-pulled-right tag is-danger"
            >
              High Priority
            </span>
          </router-link>
          <span class="has-text-grey">
            {{ shortDateStr(ex.date) }}
          </span>
          <div class="content">
            <blockquote>
              <p>{{ shortDescription(ex.description) }}</p>
            </blockquote>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'ExamsUpcoming',
  components: {},
  props: {
    filter: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {};
  },
  computed: {
    now () {
      return this.$store.state.now;
    },
    filtered () {
      return this.upcomingExams.filter(
        ex => !this.filter.includes(ex.courseCRN)
      );
    },
    upcomingExams () {
      return this.$store.state.work.upcomingExams;
    }
  },
  methods: {
    course (ex) {
      return this.$store.getters.getCourseFromCRN(ex.courseCRN);
    },
    shortDateStr (date) {
      return moment(date).format('dddd [the] Do [@] h:mma');
    },
    shortDescription (desc) {
      return desc.substring(0, 350) + '...';
    }
  }
};
</script>

<style lang="scss" scoped>
.exam-title {
  margin-bottom: 0;
  cursor: pointer;
}
</style>
