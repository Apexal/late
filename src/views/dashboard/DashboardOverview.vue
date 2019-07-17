<!--Dashboard: Overview page-->
<template>
  <div class="dashboard-overview">
    <div class="tile is-ancestor">
      <div class="tile is-parent ">
        <Timeline />
      </div>
      <div class="tile is-4 is-vertical is-parent">
        <div
          class="tile is-child notification"
          :class="courseLoad.className"
        >
          <p class="subtitle is-marginless">
            This Week
          </p>
          <p class="is-size-2">
            {{ courseLoad.title }} Courseload
          </p>
          <span class="counts">0 assignments | 0 exams | <router-link
            tag="b"
            :to="{ name: 'coursework-upcoming' }"
          >Browse</router-link></span>
        </div>

        <AssignmentsConfirm />
      </div>
    </div>
  </div>
</template>

<script>
import courseloads from '@/modules/courseloads';

import DashboardOverviewAssignmentsConfirm from './components/DashboardOverviewAssignmentsConfirm';
import DashboardOverviewTimeline from './components/DashboardOverviewTimeline';

export default {
  name: 'DashboardOverview',
  components: { AssignmentsConfirm: DashboardOverviewAssignmentsConfirm, Timeline: DashboardOverviewTimeline },
  data () {
    return {
      zoom: 13,
      sizeX: 600,
      sizeY: 300
    };
  },
  computed: {
    key () {
      return process.env.VUE_APP_GOOGLE_API_KEY;
    },
    periods () {
      return this.$store.state.schedule.periods;
    },
    imageURL () {
      let markers = this.periods.map(period => {
        const course = this.course(period);
        let color = '0x' + course.color.replace('#', '');
        let label = period.type.charAt(0);
        let locationParts = period.location.split(' ');
        let location =
          locationParts.slice(0, locationParts.length - 1).join(' ') +
          ', Troy, NY 12180';
        return `&markers=color:${color}|label:${label}|${location}`;
      });
      const url = `https://maps.googleapis.com/maps/api/staticmap?size=${
        this.sizeX
      }x${this.sizeY}&maptype=satellite${markers.join(
        ''
      )}&style=feature:all|visibility:off&style=feature:poi.school|visibility:on&key=${
        this.key
      }`;
      return encodeURI(url);
    },
    courseLoad () {
      return courseloads.weights[Math.floor(Math.random() * courseloads.weights.length)];
    }
  },
  methods: {

  }
};
</script>

<style lang="scss" scoped>

</style>
