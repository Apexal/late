<!--Assessments: Table of course periods module-->
<template>
  <table class="table is-fullwidth">
    <thead class="is-unselectable">
      <tr>
        <th>Day</th>
        <th>Time</th>
        <th>Location</th>
        <th>Type</th>
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="p in periods"
        :key="p.day + p.startTime"
      >
        <td>{{ day(p.day) }}</td>
        <td>
          {{ time(p.startTime) }}
          <span class="has-text-grey-light">-</span>
          {{ time(p.endTime) }}
        </td>
        <td>
          {{ p.location }}<a
            class="icon fa fa-map-marker-alt location-link"
            :href="'https://maps.google.com/?q=' + roomIntoLocation(p.location)"
            title="Open in Google Maps"
            target="_blank"
          />
        </td>
        <td>{{ type(p.type) }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import moment from 'moment'

export default {
  name: 'CoursePeriodsTable',
  props: {
    periods: {
      type: Array,
      required: true
    }
  },
  methods: {
    roomIntoLocation (location) {
      return this.$store.getters.roomIntoLocation(location)
    },
    time: t => {
      const dt = moment(t, 'HH:mm', true)
      if (dt.hours() === 12 && dt.minutes() === 0) {
        return 'Noon'
      } else if (dt.minutes() === 0) {
        return dt.format('ha')
      }
      return dt.format('h:mma')
    },
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
    type (pType) {
      return this.$store.getters.periodType(pType)
    }
  }
}
</script>

<style lang="scss" scoped>
td .location-link {
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

td:hover .location-link {
  opacity: 1;
}
</style>
