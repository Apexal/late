<template>
  <div class="schedule">
    <span class="has-text-grey">
      Coming soon...
    </span>
  </div>
</template>

<script>
export default {
  name: 'CourseModalSchedule',
  props: {
    course: {
      type: Object,
      required: true
    },
    schedule: {
      type: Array,
      required: true
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
