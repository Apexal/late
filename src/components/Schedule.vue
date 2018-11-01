<template>
  <div class="schedule">
    <div class="box">
      <h2 class="subtitle">Your Schedule for {{ dateStr }}</h2>
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
    dateStr () { return moment(this.schedule.date).format('YYYY-MM-DD'); }
  }
};
</script>

<style lang='scss' scoped>
</style>

