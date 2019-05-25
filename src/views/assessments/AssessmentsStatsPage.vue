<template>
  <section class="section assessment-stats">
    <b-loading
      :is-full-page="false"
      :active="loading"
      :can-cancel="false"
    />
    <h1
      class="is-hidden-desktop title"
      style="text-align:center;"
    >
      Coursework Stats
    </h1>
    <div class="tab-nav tabs is-centered">
      <ul>
        <h1
          class="is-hidden-touch title"
          style="flex: 1"
        >
          Coursework Stats
        </h1>
        <router-link
          tag="li"
          :to="{ name: 'stats-pie' }"
        >
          <a>Course Stats</a>
        </router-link>
        <router-link
          tag="li"
          :to="{ name: 'stats-bar' }"
        >
          <a>Week Stats</a>
        </router-link>
        <router-link
          tag="li"
          :to="{ name: 'stats-line' }"
        >
          <a>Assignment Stats</a>
        </router-link>
      </ul>
    </div>
    <h2 class="subtitle has-text-centered-mobile">
      Helpful insights on your classwork and assignments
    </h2>
    <transition name="slide-fade">
      <router-view />
    </transition>
  </section>
</template>

<script>
export default {
  name: 'AssessmentsStats'
};
</script>

<style lang="scss" scoped>
.charts canvas {
  margin-bottom: 50px;
}

h1 {
  margin-bottom: auto;
}

.tab-nav {
  margin-bottom: 5px;
}
</style>
