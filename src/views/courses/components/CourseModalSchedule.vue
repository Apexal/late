<!--Modals: Course overview modal schedule module-->
<template>
  <div class="schedule">
    <CoursePeriodsTable :periods="course.periods" />
    <p
      v-if="course.periods.length"
      class="has-text-centered"
    >
      <img
        :src="imageURL"
        alt
      >
    </p>
  </div>
</template>

<script>
import CoursePeriodsTable from '@/views/components/CoursePeriodsTable';
export default {
  name: 'CourseModalSchedule',
  components: { CoursePeriodsTable },
  props: {
    course: {
      type: Object,
      required: true
    }
  },
  computed: {
    key () {
      return process.env.VUE_APP_GOOGLE_API_KEY;
    },
    imageURL () {
      let markers = this.course.periods.map(period => {
        let color = '0x' + this.course.color.replace('#', '');
        let label = period.type.charAt(0);
        let locationParts = period.location.split(' ');
        let location =
          locationParts.slice(0, locationParts.length - 1).join(' ') +
          ', Troy, NY';
        return `&markers=color:${color}|label:${label}|${location}`;
      });
      const url = `https://maps.googleapis.com/maps/api/staticmap?size=400x200&maptype=roadmap${markers.join(
        ''
      )}&key=${this.key}`;
      return encodeURI(url);
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
