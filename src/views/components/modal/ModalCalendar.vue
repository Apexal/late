<template>
  <div>
    <FullCalendar
      ref="calendar"
      :editable="false"
      :selectable="false"
      :events="selectedCourseScheduleEvents"
      :header="calendar.header"
      :config="calendar.config"
    />
  </div>
</template>

<script>
import moment from 'moment';
import { FullCalendar } from 'vue-full-calendar';
import 'fullcalendar/dist/fullcalendar.css';

export default {
  name: 'ModalCalendar',
  components: {
    FullCalendar
  },
  props: ['date', 'courseCRN'],
  data () {
    return {
      calendar: {
        header: {
          left: 'title',
          center: '',
          right: 'today prev,next'
        },
        config: {
          validRange: {
            start: this.$store.getters.currentTerm.start,
            end: this.$store.getters.currentTerm.classesEnd
          },
          height: 500,
          defaultView: 'month',
          timeFormat: 'h(:mm)t',
          timezone: 'local',
          dayClick: this.dayClick,
          eventClick: this.eventClick,
          dayRender: this.dayRender
        }
      }
    };
  },
  computed: {
    selectedCourseScheduleEvents () {
      let courseSchedule = this.$store.getters.getCourseScheduleAsEvents
        .filter(
          ev =>
            (this.assessmentType === 'assignment'
              ? ev.period.type !== 'TES'
              : ev.period.type === 'TES') && ev.course.crn === this.courseCRN
        )
        .map(ev =>
          Object.assign({}, ev, { title: this.periodType(ev.period) })
        );

      // If course does not have TEST blocks, just show all periods
      if (courseSchedule.length === 0) {
        courseSchedule = this.$store.getters.getCourseScheduleAsEvents
          .filter(ev => ev.course.crn === this.courseCRN)
          .map(ev =>
            Object.assign({}, ev, { title: this.periodType(ev.period) })
          );
      }

      return courseSchedule;
    }
  },
  watch: {
    courseCRN () {
      this.$refs.calendar.fireMethod('prev');
      this.$refs.calendar.fireMethod('next');
    },
    date () {
      this.$refs.calendar.fireMethod('prev');
      this.$refs.calendar.fireMethod('next');
    }
  },
  methods: {
    course (crn) {
      return this.$store.getters.getCourseFromCRN(crn);
    },
    eventClick (calEvent, jsEvent, view) {
      this.$emit('update-time', moment(calEvent.start).format('HH:mm'));
      this.updateDate(moment(calEvent.start).startOf('day'));
    },
    dayRender (date, cell) {
      if (moment(date).isSame(this.date, 'day')) {
        cell.css('background-color', this.course(this.courseCRN).color);
      }
    },
    dayClick (date) {
      this.updateDate(date);
    },
    updateDate (date) {
      if (
        moment(date)
          .endOf('day')
          .isBefore(moment().startOf('day')) &&
        !confirm(`Add this ${this.assessmentType} to the past?`)
      ) {
        return;
      }
      this.$emit('update-date', date);
    },
    periodType (p) {
      return this.$store.getters.periodType(p.type);
    }
  }
};
</script>

<style lang="scss" scoped>
.selected-date {
  background-color: black;
}
</style>
