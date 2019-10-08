<template>
  <div class="study-groups-create">
    <div class="class-selection">
      <h1 class="subtitle study-group-heading">
        Select a class
      </h1>
      <div
        v-for="course in courses"
        :key="course.crn"
        class="course box"
      >
        <b-checkbox
          v-model="chosenCourse"
          :true-value="course"
        />
        <span class="has-text-grey">
          {{ course.summary }}
        </span>
        <span>
          {{ course.title }}
        </span>
        <div class="tags is-pulled-right">
          <span class="tag is-rounded">
            Section {{ course.sectionId }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'StudyGroupsCreate',
  data () {
    return {
      chosenCourse: ''
    }
  }
}
</script>
<style lang="scss" scoped>
.study-group-heading {
  margin-top: 1.5rem
}
</style>
