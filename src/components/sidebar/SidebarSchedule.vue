<template>
  <div class="sidebar-schedule">
    <div
      v-if="onBreak"
      class="panel-block has-text-grey"
    >
      {{ daysUntilNextTerm }} days left of break until {{ nextTerm.name }}
    </div>

    <div
      v-else-if="isWeekend"
      class="panel-block"
    >
      <h2 class="subtitle has-text-grey">
        It's the weekend!
      </h2>
    </div>

    <div class="agenda" />
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'SidebarSchedule',
  data () {
    return {};
  },
  computed: {
    todaysAgenda () {
      return this.$store.getters.todaysAgenda;
    },
    currentTerm () {
      return this.$store.getters.currentTerm;
    },
    nextTerm () {
      return this.$store.getters.nextTerm;
    },
    onBreak () {
      return this.$store.getters.onBreak;
    },
    daysUntilNextTerm () {
      return moment(this.nextTerm.start).diff(this.now, 'days');
    },
    now () {
      return this.$store.state.now;
    },
    schedule () {
      return this.$store.state.schedule;
    },
    classesOver () {
      return this.$store.getters.classesOver;
    },
    isWeekend () {
      return moment().day() === 6 || moment().day() === 0;
    },
    dateStr () {
      return moment(this.schedule.date).format('YYYY-MM-DD');
    }
  },
  methods: {
    openCourseModal (course) {
      this.$store.commit('OPEN_COURSE_MODAL', course);
    },
    fromNow (datetime) {
      const time = moment(datetime, 'Hmm', true);
      return `${time.isBefore(this.now) ? 'Started' : 'Starting'} ${time.from(
        this.now
      )}`;
    }
  }
};
</script>

<style lang='scss' scoped>
.event-block {
  &.is-active {
    font-weight: bold;
  }
}

.event-times span {
  line-height: 1.3em; //Makes course timing more readable
}

.course-dot {
  margin-right: 5px;
}

.event-times {
  line-height: 11px;
  font-size: 12px;
  display: flex;
  flex-direction: column;
}
</style>
