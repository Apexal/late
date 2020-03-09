<template>
  <section class="section course-page">
    <h1 class="title">
      {{ courseSummary }} - {{ courseGroup.title }}
    </h1>

    <nav
      class="breadcrumb"
      aria-label="breadcrumbs"
    >
      <ul>
        <li>
          <a href="#">Bulma</a>
        </li>
        <li>
          <a href="#">Documentation</a>
        </li>
        <li>
          <a href="#">Components</a>
        </li>
        <li class="is-active">
          <a
            href="#"
            aria-current="page"
          >Breadcrumb</a>
        </li>
      </ul>
    </nav>

    <router-view />
  </section>
</template>

<script>
export default {
  name: 'CoursePage',
  data () {
    return {
      courseGroup: {}
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
  async mounted () {
    const response = await this.$http.get('/courses/unique', { params: { termCode: this.termCode, courseSummary: this.courseSummary } })

    this.courseGroup = response.data[0]
  }
}
</script>

<style lang="scss" scoped>
</style>
