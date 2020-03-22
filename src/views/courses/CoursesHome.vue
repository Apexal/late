<template>
  <section class="section courses-home">
    <h1 class="title">
      Courses
    </h1>

    <div class="courses">
      <div
        v-for="course in courseGroups"
        :key="course._id"
        class="box"
      >
        <router-link :to="{name: 'course', params: {courseSummary: course._id.replace(' ', '-')}}">
          {{ course._id }} - {{ course.title }}
        </router-link>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'CoursesHome',
  data () {
    return {
      courseGroups: []
    }
  },
  async mounted () {
    const response = await this.$http.get('/courses/unique')
    this.courseGroups = response.data
  }
}
</script>

<style lang="scss" scoped>

</style>
