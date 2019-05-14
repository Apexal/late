<template>
  <section class="section academic-utils">
    <h1 class="has-text-centered-mobile title">
      Academic Utilities
    </h1>

    <div class="tabs">
      <ul>
        <router-link
          tag="li"
          :to="{ name: 'gpa-calulator' }"
        >
          <a>GPA Calculator</a>
        </router-link>
        <router-link
          tag="li"
          :to="{ name: 'course-grade-estimator' }"
        >
          <a>Course Grade Estimator</a>
        </router-link>
      </ul>
    </div>
    <p
      v-if="$route.name === 'academic-utils'"
      class="has-text-centered has-text-grey"
    >
      Choose a tool above.
    </p>
    <router-view />
  </section>
</template>

<script>
export default {
  name: 'AcademicUtilsPage',
  props: {
    showMessage: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style lang="scss" scoped>

</style>
