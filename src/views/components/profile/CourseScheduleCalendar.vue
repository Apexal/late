<template>
  <div class="course-schedule-calendar">
    <FullCalendar
      ref="calendar"
      :events="courseEvents"
      :editable="false"
      :selectable="false"
      :config="calendar"
    />
  </div>
</template>

<script>
import moment from 'moment';
import { FullCalendar } from 'vue-full-calendar';
import 'fullcalendar/dist/fullcalendar.css';

export default {
  name: 'CourseScheduleCalendar',
  components: { FullCalendar },
  data () {
    return {
      calendar: {
        allDaySlot: false,
        minTime: '08:00:00',
        maxTime: '20:00:00',
        eventRender: this.eventRender,
        eventClick: this.eventClick,
        header: {
          right: ''
        }
      }
    };
  },
  computed: {
    courseEvents () {
      return this.$store.getters.getCourseScheduleAsEvents;
    }
  },
  methods: {
    eventRender (event) {
      if (event.eventType === 'course') {
        return moment(event.end).isBetween(event.course.startDate, event.course.endDate);
      }
    },
    eventClick (calEvent, jsEvent, view) {
      if (calEvent.eventType === 'course') {
        this.$emit('goto-course', calEvent.course._id);
      }
    }
  }
};
</script>

<style lang="scss" scoped>

</style>
