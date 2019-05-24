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
          <a>Pie Chart</a>
        </router-link>
        <router-link
          tag="li"
          :to="{ name: 'stats-bar' }"
        >
          <a>Bar Chart</a>
        </router-link>
        <router-link
          tag="li"
          :to="{ name: 'stats-line' }"
        >
          <a>Line Chart</a>
        </router-link>
      </ul>
    </div>
    <h2 class="subtitle has-text-centered-mobile">
      Helpful insights on your classwork and assignments
    </h2>
    <router-view />
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

.tab-nav {
  margin-bottom: 5px;
}
</style>
