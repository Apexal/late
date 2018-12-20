<template>
  <div
    class="sidebar-upcoming-exams"
  >
    <div
      v-if="upcoming.length == 0"
      class="panel-block has-text-grey is-size-7"
    >
      <span>No upcoming exams!</span>
    </div>
    <transition-group
      name="list"
      tag="div"
    >
      <router-link
        v-for="ex in upcoming"
        :key="ex._id"
        tag="div"
        class="exam exam-link panel-block is-size-7"
        :title="ex.description.substring(0, 500)"
        :to="{ name: 'exams-overview', params: { examID: ex._id }}"
      >
        <span class="is-full-width">
          <span
            class="dot course-dot"
            :title="course(ex).longname"
            :style="'background-color: ' + course(ex).color"
          />
          <b class="course-title is-hidden-tablet">
            {{ course(ex).longname }}
          </b>
          {{ ex.title }}
          <small
            class="has-text-grey is-pulled-right tooltip is-tooltip-left"
            :data-tooltip="toFullDateTimeString(ex.date)"
          >
            {{ fromNow(ex.date) }}
          </small>
        </span>
      </router-link>
    </transition-group>
    <div class="controls panel-block has-background-white-ter">
      <span class="is-full-width">
        <button
          class="button is-link is-small"
          @click.prevent="$emit('toggle-modal')"
        >
          <span class="icon">
            <i class="fa fa-plus" />
          </span>
          Add Exam
        </button>
        <router-link
          tag="button"
          class="button is-link is-small is-outlined is-pulled-right"
          to="/exams"
        >
          All Exams
        </router-link>
      </span>
    </div>
  </div>
</template>


<script>
import moment from 'moment';

export default {
  name: 'SidebarUpcomingExamsList',
  props: {
    upcoming: {
      type: Array,
      default: () => [],
      required: true
    }
  },
  methods: {
    fromNow (date) {
      return moment(date).from(this.now);
    },
    course (a) {
      return this.$store.getters.getCourseFromCRN(a.courseCRN);
    },
    toFullDateTimeString: date =>
      moment(date).format('ddd, MMM Do YYYY, h:mma')
  }
};
</script>

<style lang="scss" scoped>
.controls {
  .icon {
    margin-right: 0 !important;
  }
}
</style>
