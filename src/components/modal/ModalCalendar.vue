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
  props: ['activeCRN'],
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
            end: this.$store.getters.currentTerm.end
          },
          height: 500,
          defaultView: 'month',
          timeFormat: 'h(:mm)t',
          timezone: 'local',
          dayClick: this.dayClick
        }
      }
    };
  },
  computed: {
    selectedCourseScheduleEvents () {
      const courseSchedule = this.$store.getters.getCourseScheduleAsEvents.map(
        ev => Object.assign({}, ev, { title: this.periodType(ev.period) })
      );
      return courseSchedule.filter(ev => ev.course.crn === this.activeCRN);
    }
  },
  methods: {
    dayClick (date) {
      if (
        moment(date)
          .endOf('day')
          .isBefore(moment().startOf('day')) &&
        !confirm('Add this assignment to the past?')
      ) {
        return;
      }
      this.updateDate(date);
    },
    updateDate (date) {
      this.$emit('update-date', date);
    },
    periodType (p) {
      return this.$store.getters.periodType(p.type);
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
