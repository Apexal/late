<template>
  <div class="study-groups-overview">
    <p>
      {{ groupID }}
    </p>
  </div>
</template>

<script>
export default {
  name: 'StudyGroupsOverview',
  data () {
    return {
      groupInfo: null
    }
  },
  computed: {
    groupID () {
      return this.$route.params['groupID']
    }
  },
  created () {
    this.getStudyGroup()
  },
  methods: {
    async getStudyGroup () {
      let request

      try {
        request = await this.$http.get('studygroups/' + this.groupID)
      } catch (e) {
        return this.$buefy.toast.open({
          message: e.response.data.message,
          type: 'is-danger'
        })
      }

      this.groupInfo = request.data.studygroup
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
