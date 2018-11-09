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
              <th>Start</th>
              <th>End</th>
              <th>Location</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="p in sortedPeriods"
              :key="p.day + p.start">
              <td>{{ day(p.day) }}</td>
              <td>{{ endTime(p.start) }}</td>
              <td>{{ endTime(p.end) }}</td>
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
    startTime: start => moment(start, 'Hmm').format('hh:mm a'),
    endTime: end => moment(end, 'Hmm').format('hh:mm a'),
    type: pType => {
      return (
        { LEC: 'Lecture', LAB: 'Lab', TES: 'Test', REC: 'Recitation' }[pType] ||
        pType
      );
    }
  }
};
</script>

<style lang="scss" scoped>
.periods {
  overflow: auto;
}
</style>
