<template>
  <div class="course box">
    <details>
      <summary class="is-clearfix">{{ course.longname }}
        <span class="tag is-info is-pulled-right">{{ course.periods.length }} Periods</span>
        <span class="tag is-dark is-pulled-right">Section {{ course.section_id }}</span>
      </summary>

      <div class="periods">
        <table class="table is-full-width">
          <thead>
            <tr>
              <th>Day</th>
              <th>Time</th>
              <th>Location</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="p in sortedPeriods"
              :key="p.day + p.start"
            >
              <td>{{ day(p.day) }}</td>
              <td>{{ time(p.start) }} <span class="has-text-grey-light">-</span> {{ time(p.end) }}</td>
              <td>{{ p.location }}</td>
              <td>{{ type(p.type) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'Course',
  props: {
    course: {
      type: Object,
      required: true,
      default: () => {}
    }
  },
  data() {
    return {
      editing: false
    };
  },
  computed: {
    sortedPeriods() {
      return this.course.periods
        .concat()
        .sort((a, b) => parseInt(a.day) - parseInt(b.day));
    }
  },
  methods: {
    day: num =>
      [
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
      ][num],
    time: t => {
      const dt = moment(t, 'Hmm');
      if (dt.hours() == 12 && dt.minutes() == 0)
        return 'Noon';
      else if (dt.minutes() == 0)
        return dt.format('h A');
      return dt.format('h:mm A');
    },
    type (pType) {
      return this.$store.getters.periodType(pType);
    }
  }
};
</script>

<style lang="scss" scoped>
.periods {
  overflow: auto;
}
</style>
