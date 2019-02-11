<template>
  <div class="course-links">
    <ul
      v-if="links && links.length > 0"
      class="course-links"
    >
      <li
        v-for="l in links"
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
    <p
      v-else
      class="has-text-centered has-text-grey"
    >
      You haven't added any links for this course yet.
    </p>
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
  },
  computed: {
    links () {
      return this.course.links || [];
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
