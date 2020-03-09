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
        <li
          v-for="t in courseTerms"
          :key="t.code"
        >
          <router-link :to="{name: 'course-term', params: {termCode: t.code}}">
            {{ t.name }}
          </router-link>
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
      courseGroup: {
        summary: '',
        title: '',
        terms: [],
        links: []
      }
    }
  },
  computed: {
    courseTerms () {
      return this.courseGroup.terms.map(termCode => this.$store.state.schedule.terms.find(term => term.code === termCode))
    },
    courseSummary () {
      return this.$route.params.courseSummary.replace('-', ' ')
    }
  },
  async mounted () {
    const response = await this.$http.get('/courses/unique', { params: { courseSummary: this.courseSummary } })

    this.courseGroup = response.data[0]
  }
}
</script>

<style lang="scss" scoped>
</style>
