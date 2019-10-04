<template>
  <div class="study-groups-home">
    <p
      v-if="!currentGroups.length"
      class="has-text-centered has-text-grey no-groups"
    >
      No current study groups. Create or join a group to get studying!
    </p>
    <b-button
      @click="currentGroups.push('group')"
    >
      Test
    </b-button>
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
  }
}
</script>
<style lang="scss" scoped>
.no-groups {
  padding-top: 50px;
}
</style>
