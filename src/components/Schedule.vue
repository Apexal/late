<template>
  <div class="schedule panel user-courses">
    <p class="panel-heading">Today's Schedule</p>
    <template v-if="in_class">
      <div class="panel-block">
        <b>Current: </b>
        <span>{{ current_course.longname }} {{ currentPeriodType }}</span>
      </div>
    </template>
    <template v-else-if="is_weekend">
      <div class="panel-block">
        <h2 class="subtitle">It's the weekend!</h2>
      </div>
    </template>
    <template v-if="schedule.next" />
    <template v-if="classes_over">
      <div class="panel-block">
        <h2 class="subtitle">Classes are over for today!</h2>
      </div>
    </template>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'Schedule',
  data() {
    return {};
  },
  computed: {
    schedule() {
      return this.$store.state.schedule;
    },
    current_course() {
      return this.schedule.current.course;
    },
    current_period() {
      return this.schedule.current.period;
    },
    in_class() {
      return this.$store.getters.in_class;
    },
    classes_over() {
      return this.$store.getters.classes_over;
    },
    is_weekend() {
      return new Date().getDay() == 6 || new Date().getDay() == 0;
    },
    dateStr() {
      return moment(this.schedule.date).format('YYYY-MM-DD');
    },
    currentPeriodType() {
      if (!this.in_class) return;
      return this.$store.getters.periodType(this.current_period.type);
    }
  }
};
</script>

<style lang='scss' scoped>
</style>

