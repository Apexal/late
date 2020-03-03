<template>
  <section class="section study-groups">
    <h1 class="is-hidden-desktop has-text-centered is-marginless title">
      Study Groups
    </h1>
    <div class="tab-nav tabs is-centered">
      <ul>
        <h1
          class="is-hidden-touch title"
          style="flex: 1"
        >
          Study Groups
        </h1>
        <router-link
          tag="li"
          :to="{name: 'study-groups-home'}"
          title="View the study groups you are in"
        >
          <a>My Groups</a>
        </router-link>
        <router-link
          tag="li"
          :to="{name: 'study-groups-create'}"
          title="Create a new study group"
        >
          <a>Create Group</a>
        </router-link>
        <router-link
          tag="li"
          :to="{name: 'study-groups-join'}"
          title="Join your peers' study groups"
        >
          <a>Join Group</a>
        </router-link>
      </ul>
    </div>
    <router-view />
  </section>
</template>
<script>
export default {
  name: 'StudyGroups'
}
</script>
<style lang="scss" scoped>
.tab-nav {
  margin-bottom: 0;
  .title {
    margin: 0;
  }
}
</style>
