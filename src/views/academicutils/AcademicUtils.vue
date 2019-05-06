<template>
  <section class="section academic-utils">
    <h1 class="has-text-centered-mobile title">
      Academic Utilities
    </h1>

    <div class="utils columns">
      <div
        class="column is-one-third"
        @click="launch('gpa')"
      >
        <div class="util card">
          <div class="card-image">
            <figure class="image is-4by3">
              <img
                src="https://bulma.io/images/placeholders/1280x960.png"
                alt="GPA Calculator"
              >
            </figure>
          </div>
          <div class="card-content">
            <div class="media">
              <div class="media-content">
                <p class="title is-4">
                  GPA Calculator
                </p>
                <p class="subtitle is-6 is-italic">
                  No login required. Login to have your courses auto-filled.
                </p>
              </div>
            </div>

            <div class="content">
              Plug in your courses and your end of year grades to determine what your GPA will be!
            </div>
          </div>
        </div>
      </div>

      <div class="column is-one-third">
        <div
          class="util card"
          @click="launch('course-grade')"
        >
          <div class="card-image">
            <figure class="image is-4by3">
              <img
                src="https://bulma.io/images/placeholders/1280x960.png"
                alt="Course grade estimater"
              >
            </figure>
          </div>
          <div class="card-content">
            <div class="media">
              <div class="media-content">
                <p class="title is-4">
                  Course Grade Estimator
                </p>
                <p class="subtitle is-6 is-italic">
                  No login required.
                </p>
              </div>
            </div>

            <div class="content">
              Provide the grading weights for a course and your grades to estimate what your final course grade would be!
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- <div class="gpa-calculator box">
      <form
        class="form"
        @submit.prevent="addCourse"
      >
        <input
          v-model="newCourse.title"
          type="text"
          class="input"
          required
        >
        <select v-model="newCourse.gradeValue">
          <option
            v-for="(value, letter) in grades"
            :key="letter"
            :value="value"
          >
            {{ letter }}
          </option>
        </select>
        <input
          v-model="newCourse.credits"
          type="number"
          min="1"
          max="4"
          step="1"
          class="input"
        >

        <input
          type="submit"
          class="button"
          value="Add"
        >
      </form>
      <hr>
      <ul>
        <li
v-for="c in courses"
            :key="c.title"
>
          <b-tag type="is-success">
            {{ c.gradeValue }}
          </b-tag>
          <b>{{ c.title }}</b> <i>{{ c.credits }}</i>
        </li>
      </ul>
      <hr>
      <h1>{{ gpa }}</h1>
    </div> -->
  </section>
</template>

<script>
const grades = {
  'A': 4.0,
  'A-': 3.7,
  'B+': 3.3,
  'B': 3.0,
  'B-': 2.7,
  'C+': 2.3,
  'C': 2.0,
  'C-': 1.7,
  'D+': 1.3,
  'D': 1.0,
  'D-': 0.7,
  'F': 0.0
};

export default {
  name: 'AcademicUtils',
  data () {
    return {
      grades,
      newCourse: {
        title: '',
        gradeValue: 4.0,
        credits: 4
      },
      courses: []
    };
  },
  computed: {
    gpa () {
      const total = this.courses.reduce((acc, course) => acc + course.gradeValue * course.credits, 0);
      const takenCredits = this.courses.reduce((acc, course) => acc + course.credits, 0);

      return total / takenCredits;
    }
  },
  methods: {
    addCourse () {
      this.courses.push(Object.assign({}, this.newCourse));
      this.newCourse = {
        title: '',
        gradeValue: 4.0,
        credits: 4
      };
    },
    launch (utilName) {
      this.$toast.open({
        message: 'Coming soon!',
        type: 'is-warning'
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.util {
  cursor: pointer;
  transition: 0.2s box-shadow;

  &:hover {
    box-shadow: 5px 5px 15px #888888;
  }
}
</style>
