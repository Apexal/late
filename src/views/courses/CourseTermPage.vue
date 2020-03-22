<template>
  <div class="course-term">
    <h1 class="title">
      {{ term.name }}
    </h1>
    <h2 class="subtitle">
      Your peers are in {{ courseGroup.count }} sections
    </h2>

    <div class="columns is-multiline">
      <div class="column is-half course-links">
        <div class="box">
          <h2 class="subtitle">
            Links
          </h2>
          <ul>
            <li
              v-for="link in courseGroup.links"
              :key="link.url"
            >
              <a :href="link.url">{{ link.name }}</a>
              <span class="icon">
                <i class="fas fa-plus" />
              </span>
              <br>
              <span>{{ link.url }}</span>
            </li>

            <p
              v-if="courseGroup.links.length === 0"
              class="has-text-grey"
            >
              Nobody has submitted links for this course yet.
            </p>
          </ul>
        </div>
      </div>

      <div class="column is-half">
        <div class="box">
          <h2 class="subtitle">
            Upcoming Study Groups
          </h2>
          <p class="has-text-grey">
            Coming soon...
          </p>

          <a
            href="#"
            class="button is-link"
          >Create Study Group</a>
        </div>
      </div>

      <div class="column is-half">
        <div class="box">
          <h2 class="subtitle">
            Recent Backwork
          </h2>

          <a
            href="#"
            class="button is-link"
          >Browse Backwork</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CoursePage',
  data () {
    return {
      courseGroup: {
        summary: '',
        title: '',
        terms: [],
        links: []
      }
    }
  },
  computed: {
    termCode () {
      return this.$route.params.termCode
    },
    term () {
      return this.$store.state.schedule.terms.find(term => term.code === this.termCode)
    },
    courseSummary () {
      return this.$route.params.courseSummary.replace('-', ' ')
    }
  },
  watch: {
    termCode (newTermCode) {
      this.getCourseGroup(newTermCode)
    }
  },
  async mounted () {
    await this.getCourseGroup(this.termCode)
  },
  methods: {
    async getCourseGroup (termCode) {
      const response = await this.$http.get('/courses/unique', { params: { termCode, courseSummary: this.courseSummary } })

      this.courseGroup = response.data[0]
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
