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
      class="sidebar-body agenda"
    >
      <div v-if="filteredTodaysAgenda.length === 0">
        <div
          class="panel-block has-text-grey"
        >
          Nothing scheduled for the {{ todaysAgenda.length === filteredTodaysAgenda.length ? '' : 'rest of the ' }}day!
        </div>
      </div>
      <div
        v-for="event in filteredTodaysAgenda"
        :key="event.course.crn + '-' + event.start.toString() + event.end.toString()"
        class="panel-block event is-flex"
        :class="{ 'is-active': isCurrentEvent(event), 'passed': hasPassed(event.end), 'clickable': event.link }"
        @click="eventClicked(event)"
      >
        <CourseAssessmentDot :course="event.course" />
        <span
          class="event-title"
          style="flex: 1"
          :title="event.eventType === 'period' ? 'Class at ' + event.period.location : 'Work/Study'"
        >
          <template v-if="event.eventType === 'period'">
            <b
              class="period-longname"
              @click="$store.commit('OPEN_COURSE_MODAL', event.course)"
            >{{ event.course.longname }}</b>
            <span class="has-text-grey">{{ periodType(event.period.type) }}</span>
          </template>
          <template v-else-if="event.eventType === 'work-block'">
            <span>{{ event.assessmentType === 'assignment' ? 'Work on ' : 'Study for ' }}</span>
            <b>{{ event.assessment.title }}</b>
          </template>
        </span>

        <span
          class="event-times is-pulled-right has-text-grey tooltip is-tooltip-left"
          :data-tooltip="timeFormat(event.start) + ' - ' + timeFormat(event.end)"
        >{{ timeFormat(event.start) }}</span>
      </div>
    </div>
    <div class="panel-block has-background-light has-text-centered">
      <b-button
        :class="{ 'is-active': showPassed }"
        class="is-fullwidth showPassedButton"
        @click="showPassed = !showPassed"
      >
        <i
          class="show-passed-icon far"
          :class="[ showPassed ? 'fa-eye' : 'fa-eye-slash' ]"
        />
        {{ showPassed ? 'Hide' : 'Show' }} Passed
      </b-button>
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import 'bulma-switch';

export default {
  name: 'SidebarSchedule',
  props: {
    todaysAgenda: { type: Array, required: true }
  },
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
    periodType (type) {
      return this.$store.getters.periodType(type);
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
  padding: 10px;
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

  .period-longname {
    cursor: pointer;
    margin-right: 3px;
  }
}

.showPassedButton:hover {
    background-color:#f5efef;
}
.showPassedButton:focus {
  border-color: black;
  box-shadow: none!important;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0) !important;
}

.show-passed-icon {
  margin-right: 5px;
}
</style>
