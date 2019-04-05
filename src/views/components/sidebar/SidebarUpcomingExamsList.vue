<template>
  <div class="sidebar-upcoming-exams">
    <template v-if="onBreak">
      <div class="panel-block has-text-grey">
        There's no exams over break!
      </div>
    </template>
    <template v-else>
      <div
        v-if="upcoming.length == 0"
        class="panel-block has-text-grey"
      >
        <span class="has-text-centered">
          No upcoming exams within the next month!
        </span>
      </div>
      <transition-group
        name="list"
        tag="div"
        class="sidebar-body"
      >
        <router-link
          v-for="ex in upcoming"
          :key="ex._id"
          tag="div"
          class="exam exam-link panel-block"
          :title="ex.description.substring(0, 500)"
          :to="{ name: 'exam-overview', params: { examID: ex._id }}"
        >
          <span class="is-full-width">
            <span
              class="dot course-dot"
              :title="course(ex).longname"
              :style="'background-color: ' + course(ex).color"
              @click.prevent="$store.commit('OPEN_COURSE_MODAL', course(ex))"
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
            title="Add an upcoming exam"
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
            title="View all upcoming exams"
          >
            View Exams
          </router-link>
        </span>
      </div>
    </template>
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
  computed: {
    onBreak () {
      return this.$store.getters.onBreak;
    }
  },
  methods: {
    fromNow (date) {
      return moment(date).from(this.now);
    },
    course (a) {
      return this.$store.getters.getCourseFromCRN(a.courseCRN);
    },
    toFullDateTimeString: date => moment(date).format('ddd, MMM Do YYYY, h:mma')
  }
};
</script>

<style lang="scss" scoped>
.exam {
  cursor: pointer;

  .exam-link {
    color: inherit;
  }

  .course-title {
    margin-left: 5px;
  }
}

.controls {
  .icon {
    margin-right: 0 !important;
  }
}
</style>
