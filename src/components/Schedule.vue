<template>
  <div class="schedule">
    <div class="box">
      <h2 class="subtitle">Your Schedule for {{ dateStr }}</h2>
      <template v-if="schedule.in_class">
        <span class="icon">
          <i class="fas fa-chalkboard-teacher"/>
        </span>
        <b>{{ schedule.current_period.longname }} {{ currentPeriodType }}</b>
      </template>
    </div>
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
    dateStr () { return moment(this.schedule.date).format('YYYY-MM-DD'); },
    currentPeriodType () {
      if (!this.schedule.in_class) return;
      switch(this.schedule.current_period.type) {
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

