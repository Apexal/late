<template>
  <div class="dashboard-overview">
    <div class="tile is-ancestor">
      <div class="tile is-parent">
        <article class="tile is-child notification is-success">
          <div class="content">
            <p class="title">
              Today's Class Locations
            </p>
            <div class="content">
              <router-link to="/">
                <img
                  :src="imageURL"
                  alt="Map of locations of today's periods"
                >
              </router-link>
            </div>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DashboardOverview',
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
      return this.$store.getters.current_courses.map(course => course.periods.filter(p => p.day === 1)).flat();
    },
    imageURL () {
      let markers = this.periods.map(period => {
        const course = this.course(period);
        let color = '0x' + course.color.replace('#', '');
        let label = period.type.charAt(0);
        let locationParts = period.location.split(' ');
        let location = locationParts.slice(0, locationParts.length - 1).join(' ') + ', Troy, NY 12180';
        return `&markers=color:${color}|label:${label}|${location}`;
      });
      const url = `https://maps.googleapis.com/maps/api/staticmap?size=${this.sizeX}x${this.sizeY}&maptype=satellite${markers.join('')}&key=${this.key}`;
      return encodeURI(url);
    }
  },
  methods: {
    course (p) {
      return this.$store.getters.getCourseFromPeriod(p);
    }
  }
};
</script>

<style>

</style>
