<template>
  <section class="section academic-utils">
    <h1
      class="is-hidden-desktop title"
      style="text-align:center;"
    >
      Grade Calculators
    </h1>
    <div class="tab-nav tabs is-centered">
      <ul>
        <h1
          class="is-hidden-touch title"
          style="flex: 1"
        >
          Grade Calculators
        </h1>
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
    <h2
      class="subtitle has-text-centered-mobile"
    >
      Estimates your final course grades and cumulative grade point average
    </h2>

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
}
.tab-nav {
  margin-bottom: 0;
  .title {
    margin: 0;
  }
}
</style>
