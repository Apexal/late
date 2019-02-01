<template>
  <div class="sidebar-schedule">
    <div
      v-if="onBreak"
      class="panel-block has-text-grey"
    >
      {{ daysUntilNextTerm }} days left of break until {{ nextTerm.name }}
    </div>
    <div
      v-else-if="!setup"
      class="panel-block has-text-grey"
    >
      You have not set your course schedule yet!
    </div>
    <div
      v-else
      class="agenda"
    >
      <div v-if="filteredTodaysAgenda.length === 0">
        <div class="panel-block has-text-grey">
          No courses or scheduled work today!
        </div>
      </div>
      <div
        v-for="event in filteredTodaysAgenda"
        :key="event.title + '-' + event.start.toString()"
        class="panel-block event is-size-7"
        :class="{ 'passed': hasPassed(event.end), 'has-background-success': isCurrentEvent(event), 'clickable': event.link }"
        @click="eventClicked(event)"
      >
        <span class="is-full-width">
          <span
            class="course-dot dot"
            :style="'background-color: ' + event.course.color"
            @click="$store.commit('OPEN_COURSE_MODAL', event.course)"
          />
          <span
            class="event-title tooltip is-tooltip-right"
            :data-tooltip="event.eventType === 'period' ? 'Class at ' + event.period.location : 'Work/Study'"
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
      <div class="controls panel-block">
        <span class="is-full-width">
          <div class="field">
            <input
              id="agenda-show-passed"
              v-model="showPassed"
              type="checkbox"
              class="switch"
            >
            <label for="agenda-show-passed">
              Show Passed
            </label>
          </div>
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import 'bulma-switch';

export default {
  name: 'SidebarSchedule',
  data () {
    return {
      showPassed: true
    };
  },
  computed: {
    setup () {
      return this.$store.getters.userSetup.course_schedule;
    },
    filteredTodaysAgenda () {
      return this.showPassed
        ? this.todaysAgenda
        : this.todaysAgenda.filter(e => !this.hasPassed(e.end));
    },
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
    },
    currentEvent () {
      return this.todaysAgenda.find(this.isCurrentEvent);
    }
  },
  watch: {
    currentEvent (newCurrentEvent) {
      this.$emit('update-current-event', newCurrentEvent);
    },
    showPassed (sP) {
      localStorage.setItem('agendaShowPassed', sP);
    }
  },
  mounted () {
    if (localStorage.getItem('agendaShowPassed')) {
      try {
        this.showPassed = JSON.parse(localStorage.getItem('agendaShowPassed'));
      } catch (e) {
        localStorage.removeItem('agendaShowPassed');
      }
    }
  },
  created () {
    this.$emit('update-current-event', this.currentEvent);
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
  &.clickable {
    cursor: pointer;
  }
  &.has-background-success {
    font-weight: bold;
    color: white;
    .event-times span {
      color: white;
    }
  }

  &.passed {
    background-color: #eaeaea;
    color: #929292;
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

.agenda-show-passed {
  font-weight: 100;
}
</style>
