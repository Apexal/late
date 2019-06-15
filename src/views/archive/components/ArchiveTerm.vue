<template>
  <div class="archive-term">
    <b-loading
      :is-full-page="false"
      :active="loading"
      :can-cancel="false"
    />

    <h2 class="subtitle">
      {{ term.name }}
    </h2>
    <div class="box summary has-text-centered">
      Ran from <b>{{ longDateFormat(term.start) }}</b> to
      <b>{{ longDateFormat(term.end) }}</b> — {{ termCourses.length }} courses —
      {{ termAssignments.length }} assignments — {{ termExams.length }} exams —
      {{ termTodos.length }} todo's
    </div>

    <h2 class="subtitle">
      Courses
    </h2>
    <ol>
      <li
        v-for="(course, index) in termCourses"
        :key="index"
      >
        <i
          class="course-dot"
          :style="{ backgroundColor: course.color }"
        />
        {{ course.title }}
      </li>
    </ol>
    <hr>

    <h2 class="subtitle">
      Coursework
    </h2>
    <hr>

    <h2 class="subtitle">
      Todos
    </h2>
    <hr>

    <router-link
      class="button is-link"
      :to="{ name: 'archive-home' }"
    >
      <span class="icon">
        <i class="fas fa-angle-left" />
      </span>
      Select Semester
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'ArchiveTerm',
  data () {
    return {
      loading: true,
      termCourses: [],
      termAssignments: [],
      termExams: [],
      termTodos: []
    };
  },
  computed: {
    hasTerm () {
      return !!this.term;
    },
    term () {
      return this.$store.state.schedule.terms.find(
        term => term.code === this.$route.params.termCode
      );
    }
  },
  mounted () {
    this.getTermData();
  },
  methods: {
    async getTermData () {
      this.loading = true;

      // Get courses
      let response;
      try {
        response = await this.$http.get('/courses?termCode=' + this.term.code);
      } catch (e) {
        this.$toast.open({ type: 'danger', message: e.response.data.message });
        this.loading = false;
        return;
      }

      this.termCourses = response.data.courses;

      this.loading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.course-dot {
  width: 10px;
  height: 10px;
  border-radius: 100%;
  display: inline-block;
}

.button .icon {
  margin-right: 3px !important;
}
</style>
