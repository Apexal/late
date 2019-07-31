<template>
  <div class="next-term-preview">
    <div class="columns">
      <div
        v-if="nextTerm"
        class="column is-9"
      >
        <div class="box">
          <FullCalendar
            ref="calendar"
            :plugins="calendar.plugins"
            default-view="timeGridWeek"
            :height="500"
            :valid-range="validRange"
            :events="courseEvents"
            :weekends="false"
            :all-day-slot="false"
            min-time="08:00:00"
            max-time="20:00:00"
          />
        </div>
      </div>
      <div class="column has-text-centered is-size-4">
        <div class="tile  is-vertical">
          <div class="tile is-child notification is-primary">
            <b>{{ nextTermCourses.length }}</b> courses
          </div>
          <div class="tile is-child notification is-dark">
            ~<b>{{ nextTermCourseHourCount.hours }}hrs</b>&nbsp;<b>{{ nextTermCourseHourCount.minutes }}min</b>
            of class each week
          </div>
          <div class="tile is-child notification is-warning">
            <b>{{ earliestClassTime }}</b> earliest start of class
          </div>
          <div class="tile is-child notification is-danger">
            <b>{{ latestClassTime }}</b> latest end of class
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';

import FullCalendar from '@fullcalendar/vue';

import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';

import '@fullcalendar/core/main.css';
import '@fullcalendar/daygrid/main.css';
import '@fullcalendar/timegrid/main.css';

export default {
  name: 'DashboardNextTermPreview',
  components: { FullCalendar },
  data () {
    return {
      nextTermCourses: [],
      calendar: {
        plugins: [dayGridPlugin, timeGridPlugin]
      }
    };
  },
  computed: {
    nextTerm () {
      return this.$store.getters.nextTerm;
    },
    courseEvents () {
      return this.nextTermCourses.map(this.$store.getters.mapCourseToEvents).flat();
    },
    validRange () {
      return {
        start: this.nextTerm.start,
        end: this.nextTerm.end
      };
    },
    nextTermPeriods () {
      return this.nextTermCourses.map(course => course.periods)
        .flat();
    },
    nextTermCourseHourCount () {
      // Tally up durations of all periods
      let total = this.nextTermPeriods
        .reduce((acc, period) => acc + moment(period.end, 'Hmm').diff(moment(period.start, 'Hmm'), 'minutes'), 0);

      return {
        hours: parseInt(total / 60),
        minutes: total % 60
      };
    },
    earliestClassTime () {
      let earliest = 2300;

      for (let period of this.nextTermPeriods) {
        if (parseInt(period.start) < earliest) { earliest = parseInt(period.start); }
      }

      return moment(earliest, 'Hmm', true).format('h:mm a');
    },
    latestClassTime () {
      let latest = 800;

      for (let period of this.nextTermPeriods) {
        if (parseInt(period.end) > latest) { latest = parseInt(period.end); }
      }

      return moment(latest, 'Hmm', true).format('h:mm a');
    }
  },
  async mounted () {
    // Get courses for next term
    let request;
    try {
      request = await this.$http.get(`/courses/term/${this.nextTerm.code}`);
    } catch (e) {
      alert(e);
      return;
    }

    this.nextTermCourses = request.data.courses;
  }
};
</script>

<style lang="scss" scoped>

</style>
