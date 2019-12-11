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
      <b>{{ longDateFormat(term.end) }}</b> —
      <a href="#archive-courses">{{ termCourses.length }} courses</a> —
      <a
        href="#archive-assignments"
      >{{ termAssignments.length }} assignments</a>
      — <a href="#archive-exams">{{ termExams.length }} exams</a> —
      {{ termTodos.length }} todo's
    </div>

    <h2
      id="archive-courses"
      class="subtitle"
    >
      Courses
    </h2>
    <ol>
      <li
        v-for="(course, index) in termCourses"
        :key="index"
      >
        <i
          class="course-dot"
          :style="{backgroundColor: course.color}"
        />
        {{ course.title }}
      </li>
    </ol>
    <hr>

    <h2
      id="archive-assignments"
      class="subtitle"
    >
      Assignments
    </h2>

    <div class="assignments">
      <table class="table is-fullwidth">
        <thead>
          <tr>
            <th>Due Date</th>
            <th>Course</th>
            <th>Title</th>
            <th>Completed</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(assignment, index) in termAssignments"
            :key="index"
          >
            <td>{{ shortDateTimeFormat(assignment.dueDate) }}</td>
            <td>
              <i
                class="course-dot"
                :style="{
                  backgroundColor: termCourse(assignment.courseCRN).color
                }"
              />
              {{ termCourse(assignment.courseCRN).title }}
            </td>
            <td>{{ assignment.title }}</td>
            <td :title="assignment.completedAt">
              <i
                class="fas"
                :class="[assignment.completed ? 'fa-check' : 'fa-times']"
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <hr>

    <h2
      id="archive-exams"
      class="subtitle"
    >
      Exams
    </h2>

    <div class="exams">
      <table class="table is-fullwidth">
        <thead>
          <tr>
            <th>Date</th>
            <th>Course</th>
            <th>Title</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(exam, index) in termExams"
            :key="index"
          >
            <td>{{ shortDateTimeFormat(term.date) }}</td>
            <td>
              <i
                class="course-dot"
                :style="{
                  backgroundColor: termCourse(exam.courseCRN).color
                }"
              />
              {{ termCourse(exam.courseCRN).title }}
            </td>
            <td>{{ exam.title }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <hr>

    <h2 class="subtitle">
      Todos
    </h2>
    <hr>

    <router-link
      class="button is-link"
      :to="{name: 'archive-home'}"
    >
      <span class="icon">
        <i class="fas fa-angle-left" />
      </span>
      <span>Select Semester</span>
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
    }
  },
  computed: {
    hasTerm () {
      return !!this.term
    },
    term () {
      return this.$store.state.schedule.terms.find(
        term => term.code === this.$route.params.termCode
      )
    },
    terms () {
      return this.$store.state.schedule.terms
    },
    removedCourse () {
      return {
        section_id: '00',
        originalTitle: 'Removed Course',
        title: 'Removed Course',
        summary: 'REMOVED',
        credits: 0,
        crn: '00000',
        color: 'grey',
        periods: [],
        links: []
      }
    }
  },
  watch: {
    terms: 'getTermData'
  },
  mounted () {
    this.getTermData()
  },
  methods: {
    termCourse (courseCRN) {
      return (
        this.termCourses.find(course => course.crn === courseCRN) ||
        this.removedCourse
      )
    },
    async getTermData () {
      if (this.terms.length === 0) return

      this.loading = true

      // Get courses
      let response
      try {
        response = await this.$http.get('/courses/term/' + this.term.code)
      } catch (e) {
        this.$buefy.toast.open({
          type: 'is-danger',
          message: e.response.data.message
        })
        this.loading = false
        return
      }

      this.termCourses = response.data.courses

      // Get assignments
      try {
        response = await this.$http.get('/assignments/term/' + this.term.code)
      } catch (e) {
        this.$buefy.toast.open({
          type: 'is-danger',
          message: e.response.data.message
        })
        this.loading = false
        return
      }

      this.termAssignments = response.data.assignments

      // Get exams
      try {
        response = await this.$http.get('/exams/term/' + this.term.code)
      } catch (e) {
        this.$buefy.toast.open({
          type: 'is-danger',
          message: e.response.data.message
        })
        this.loading = false
        return
      }

      this.termExams = response.data.exams

      this.loading = false
    }
  }
}
</script>

<style lang="scss" scoped>
.course-dot {
  width: 10px;
  height: 10px;
  border-radius: 100%;
  display: inline-block;
}

.fa-check {
  color: green;
}

.fa-times {
  color: red;
}
</style>
