<template>
  <div class="courses-home">
    <h1 class="title">
      Courses
    </h1>

    <div class="courses">
      <div
        v-for="course in courseGroups"
        :key="course._id"
        class="box"
      >
        {{ course._id }}
      </div>
    </div>
  </div>
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
