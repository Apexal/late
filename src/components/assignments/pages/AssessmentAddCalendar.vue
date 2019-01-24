<template>
  <div>
    <h2>What day is the assignment due</h2>
    <FullCalendar
      ref="calendar"
      :editable="false"
      :selectable="false"
      :header="calendar.header"
      :config="calendar.config"
    />
  </div>
</template>

<script>
import { FullCalendar } from 'vue-full-calendar';
import 'fullcalendar/dist/fullcalendar.css';

export default {
  name: 'AssessmentAddCalendar',
  components: {
    FullCalendar
  },
  data () {
    return {
      calendar: {
        events: [],
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
          dayClick: (date) => {
            // console.log(date);
            this.updateDate(date);
          }
        }
      }
    };
  },
  methods: {
    updateDate (date) {
      this.$emit('update-date', date);
    }
  }
};
</script>

<style lang="scss" scoped>

</style>
