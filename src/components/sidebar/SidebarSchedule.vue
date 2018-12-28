<template>
  <div class="sidebar-schedule">
    <div
      v-if="onBreak"
      class="panel-block has-text-grey"
    >
      {{ daysUntilNextTerm }} days left of break until {{ nextTerm.name }}
    </div>

    <div
      v-else
      class="agenda"
    >
      <div v-if="todaysAgenda.length === 0">
        <div class="panel-block has-text-grey">
          No courses or scheduled work today!
        </div>
      </div>
      <div
        v-for="event in todaysAgenda"
        :key="event.title"
        class="panel-block event is-size-7"
        :class="{ 'passed': hasPassed(event.end), 'has-background-success': isCurrentEvent(event) }"
      >
        <span class="is-full-width">
          <span
            class="course-dot dot"
            :style="'background-color: ' + event.course.color"
            @click="$store.commit('OPEN_COURSE_MODAL', event.course)"
          />
          <span
            class="event-title"
            @click="eventClicked(event)"
          >
            {{ event.title }}
          </span>
          <div
            class="event-times is-pulled-right has-text-grey tooltip is-tooltip-left"
            :data-tooltip="duration(event) + ' minutes'"
          >
            <span>{{ timeFormat(event.start) }}</span>
            <span>{{ timeFormat(event.end) }}</span>
          </div>
        </span>
      </div>
    </div>
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
    eventClicked (event) {
      if (event.link) this.$router.push(event.link);
    },
    fromNow (datetime) {
      const time = moment(datetime, 'Hmm', true);
      return `${time.isBefore(this.now) ? 'Started' : 'Starting'} ${time.from(
        this.now
      )}`;
    },
    hasPassed (datetime) {
      return datetime.isBefore(this.now);
    },
    isCurrentEvent (event) {
      return moment(this.now).isBetween(event.start, event.end);
    },
    duration: p => p.end.diff(p.start, 'minutes'),
    timeFormat: datetime => datetime.format('h:mma')
  }
};
</script>

<style lang='scss' scoped>
.event {
  cursor: pointer;
  &.has-background-success {
    font-weight: bold;
    color: white;
    .event-times span {
      color: white;
    }
  }

  &.passed {
    text-decoration: line-through;
  }

  .course-dot {
    margin-right: 5px;
  }

  .event-times {
    line-height: 11px;
    font-size: 12px;
    display: flex;
    flex-direction: column;
    span {
      line-height: 1.3em; //Makes course timing more readable
    }
  }
}
</style>
