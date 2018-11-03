<template>
  <div class="schedule panel user-courses">
    <p class="panel-heading">Today's Schedule</p>
    <template v-if="schedule.in_class">
      <div class="panel-block">
        <b>Current: </b>
        <span>{{ current_course.longname }} {{ currentPeriodType }}</span>
      </div>
    </template>
    <template v-if="schedule.next"/>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'Schedule',
  data () {
    return {

    };
  },
  computed: {
    schedule () { return this.$store.state.schedule; },
    current_course () { return this.schedule.current.course; },
    current_period () { return this.schedule.current.period; },
    dateStr () { return moment(this.schedule.date).format('YYYY-MM-DD'); },
    currentPeriodType () {
      if (!this.schedule.in_class) return;
      switch(this.current_period.type) {
      case 'TES':
        return 'Test';
      case 'LEC':
        return 'Lecture';
      default:
        return 'Class';
      }
    }
  }
};
</script>

<style lang='scss' scoped>
</style>

