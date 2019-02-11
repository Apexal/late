<template>
  <div class="course-links">
    <ul
      v-if="course.links && course.links.length > 0"
      class="course-links"
    >
      <li
        v-for="l in course.links"
        :key="l"
      >
        <a
          :href="l"
          target="_blank"
          :title="l"
        >
          {{ l }}
        </a>
      </li>
    </ul>
    <span
      v-else
      class="has-text-centered has-text-grey"
    >
      No links added.
    </span>
  </div>
</template>

<script>
export default {
  name: 'CourseModalLinks',
  props: {
    course: {
      type: Object,
      required: true
    }
  }
};
</script>

<style lang="scss" scoped>
.course-links li {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
