<template>
  <section class="section academic-utils">
    <h1 class="has-text-centered-mobile title">
      Grade Calculators
    </h1>
    <h2
      class="subtitle has-text-centered-mobile"
    >
      Estimates your final course grades and cumulative grade point average
    </h2>

    <div class="tabs">
      <ul>
        <router-link
          tag="li"
          :to="{ name: 'gpa-calulator' }"
        >
          <a>GPA</a>
        </router-link>
        <router-link
          tag="li"
          :to="{ name: 'course-grade-estimator' }"
        >
          <a>Course Grades</a>
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
.title {
  padding-bottom: 0px;
  padding-left: 0px;
  border-bottom-color: #dbdbdb;
  border-bottom-style: solid;
  border-bottom-width: 1px;
}
</style>
