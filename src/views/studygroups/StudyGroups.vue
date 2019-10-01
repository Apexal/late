<template>
  <section class="section study-groups">
    <h1 class="title">
      Study Groups
    </h1>
    <router-view />
  </section>
</template>
<script>
export default {
  name: 'StudyGroups'
}
</script>
<style lang="scss" scoped>
.title {
  padding-bottom: 0px;
  padding-left: 0px;
  border-bottom-color: #dbdbdb;
  border-bottom-style: solid;
  border-bottom-width: 1px;
}
</style>
