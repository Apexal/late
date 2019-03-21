<template>
  <div class="schedule">
    <span class="has-text-grey">
      <CoursePeriodsTable :periods="course.periods" />
    </span>
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
  }
};
</script>

<style lang="scss" scoped>
</style>
