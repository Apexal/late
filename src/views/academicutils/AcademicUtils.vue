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
  </section>
</template>

<script>
export default {
  name: 'AcademicUtils',
  methods: {
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
