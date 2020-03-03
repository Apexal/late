<!--Tools: Main selection page-->
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
          :to="{name: 'gpa-calculator'}"
        >
          <a>GPA</a>
        </router-link>
        <router-link
          tag="li"
          :to="{name: 'course-grade-estimator'}"
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
    <router-view />
    <hr>
    <div class="buttons">
      <router-link
        class="button is-link"
        :to="{name: 'tools'}"
      >
        <i class="fas fa-angle-left" />
        All Tools
      </router-link>
    </div>
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
}
</script>

<style lang="scss" scoped>
.button i.fas {
  margin-right: 3px;
}

.tab-nav {
  margin-bottom: 0;
}
</style>
