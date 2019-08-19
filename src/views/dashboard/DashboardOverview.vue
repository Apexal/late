<!--Dashboard: Overview page-->
<template>
  <div class="dashboard-overview">
    <div class="tile is-ancestor">
      <div class="tile is-5 is-parent ">
        <Timeline />
      </div>

      <div class="tile is-vertical">
        <div
          v-show="doingSomething"
          class="tile is-parent "
        >
          <Current @current-status="doingSomething = arguments[0] !== 'nothing'" />
        </div>
        <div class="tile is-parent">
          <AssignmentsConfirm />
          <Courseload />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import DashboardOverviewAssignmentsConfirm from './components/DashboardOverviewAssignmentsConfirm'
import DashboardOverviewTimeline from './components/DashboardOverviewTimeline'
import DashboardOverviewCurrent from './components/DashboardOverviewCurrent'
import DashboardOverviewCourseload from './components/DashboardOverviewCourseload'

export default {
  name: 'DashboardOverview',
  components: { AssignmentsConfirm: DashboardOverviewAssignmentsConfirm, Timeline: DashboardOverviewTimeline, Current: DashboardOverviewCurrent, Courseload: DashboardOverviewCourseload },
  data () {
    return {
      doingSomething: true,
      zoom: 13,
      sizeX: 600,
      sizeY: 300
    }
  },
  computed: {
    key () {
      return process.env.VUE_APP_GOOGLE_API_KEY
    },
    periods () {
      return this.$store.getters.todayPeriods
    },
    imageURL () {
      const markers = this.periods.map(period => {
        const course = this.course(period)
        const color = '0x' + course.color.replace('#', '')
        const label = period.type.charAt(0)
        const locationParts = period.location.split(' ')
        const location =
          locationParts.slice(0, locationParts.length - 1).join(' ') +
          ', Troy, NY 12180'
        return `&markers=color:${color}|label:${label}|${location}`
      })
      const url = `https://maps.googleapis.com/maps/api/staticmap?size=${
        this.sizeX
      }x${this.sizeY}&maptype=satellite${markers.join(
        ''
      )}&style=feature:all|visibility:off&style=feature:poi.school|visibility:on&key=${
        this.key
      }`
      return encodeURI(url)
    }
  },
  methods: {

  }
}
</script>

<style lang="scss" scoped>

</style>
