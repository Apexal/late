<template>
  <div class="study-groups-home">
    <p
      v-if="!currentGroups.length"
      class="has-text-centered has-text-grey no-groups"
    >
      No current study groups. Create or join a group to get studying!
    </p>
    <div
      v-if="currentGroups.length"
      class="group-boxes"
      style="margin-top:1.5rem"
    >
      <div
        v-for="group in currentGroups"
        :key="group._id"
        class="course box"
      >
        <router-link
          :to="{
            name: 'study-groups-overview',
            params: {['groupID']: group._id}
          }"
        >
          <span class="has-text-grey">
            {{ group.course.title }} |
          </span>
          <span class="has-text-grey">
            {{ group.title }}
          </span>
        </router-link>
        <span class="is-pulled-right">
          {{ group.date }} @ {{ group.time }}
        </span>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'StudyGroupsHome',
  props: {
    currentGroups: {
      type: Array,
      default: () => []
    }
  },
  created () {
    this.getStudyGroups()
  },
  methods: {
    async getStudyGroups () {
      let request
      try {
        request = await this.$http.get('/studygroups')
        this.currentGroups = request.data.studygroups
      } catch (e) {
        console.log(e)
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.no-groups {
  margin-top: 1.5em;
}
</style>
