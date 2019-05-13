<template>
  <section class="section academic-utils">
    <h1 class="has-text-centered-mobile title">
      Academic Utilities
    </h1>

    <div class="tabs">
      <ul>
        <li
          :class="{ 'is-active': util === 'GPACalculator' }"
          @click="util = 'GPACalculator'"
        >
          <a>GPA Calculator</a>
        </li>
        <li
          :class="{ 'is-active': util === 'CourseGradeEstimator' }"
          @click="util = 'CourseGradeEstimator'"
        >
          <a>Course Grade Estimator</a>
        </li>
      </ul>
    </div>

    <Component :is="util" />
  </section>
</template>

<script>
import GPACalculator from './GPACalculator';
import CourseGradeEstimator from './CourseGradeEstimator';

export default {
  name: 'AcademicUtils',
  components: { GPACalculator, CourseGradeEstimator },
  data () {
    return {
      util: 'GPACalculator'
    };
  }
};
</script>

<style lang="scss" scoped>

</style>
