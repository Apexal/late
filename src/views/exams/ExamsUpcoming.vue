<template>
  <div class="exams-upcoming">
    <p
      v-if="filtered.length === 0"
      class="has-text-centered has-text-grey"
    >
      No upcoming exams
      <i
        v-if="filter.length > 0"
        style="font-style:inherit"
      >matching your filters.</i>
      <i
        v-if="filter.length <= 0"
        style="font-style:inherit"
      >this month!</i>
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
        <div class="upcoming-exam">
          <router-link
            tag="h2"
            :to="{ name: 'exam-overview', params: { examID: ex._id }}"
            class="exam-title subtitle"
            title="Click to open overview."
          >
            <b>{{ course(ex).longname }}</b>
            {{ ex.title }}
            <span
              v-if="ex.priority === 3"
              class="is-pulled-right tag is-danger"
            >High Priority</span>
            <span
              v-else-if="ex.priority === 1"
              class="is-pulled-right tag is-dark"
            >Low Priority</span>
          </router-link>
          <span
            class="has-text-grey tooltip is-tooltip-right"
            :data-tooltip="fromNow(ex.date)"
          >{{ shortDateStr(ex.date) }}</span>
          <span
            :style="{visibility: ex.fullyScheduled ? 'hidden' : ''}"
            class="tooltip is-tooltip-right icon has-text-danger"
            :data-tooltip="`You've only scheduled ${ex.scheduledTime} out of ${ex.timeEstimate * 60} min to study for this.`"
          >
            <i class="far fa-clock" />
          </span>
          <div class="content">
            <blockquote>
              <p v-if="ex.description">
                {{ shortDescription(ex.description) }}
              </p>
              <p
                v-else
                class="has-text-grey"
              >
                No description given...
              </p>
            </blockquote>
          </div>
          <hr>
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
      return moment(date).format('ddd, MMM Do [@] h:mma');
    },
    fromNow (date) {
      return moment(date).from(this.now);
    },
    shortDescription (desc) {
      if (desc.length > 350) return desc.substring(0, 350) + '...';
      else return desc;
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
