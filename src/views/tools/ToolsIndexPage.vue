<template>
  <section class="section tools-page">
    <h1 class="title has-text-centered-mobile">
      Tools
    </h1>

    <div class="tile is-ancestor">
      <div class="tile">
        <div class="tile is-parent is-vertical">
          <router-link
            tag="article"
            :to="{ name: 'checklist' }"
            class="tile is-child notification is-primary"
          >
            <p class="title">
              Checklist
            </p>
            <p class="subtitle">
              Create a checklist for all the items you need to move into your
              dorm!
            </p>
          </router-link>
          <router-link
            tag="article"
            :to="{ name: 'study-tools' }"
            class="tile is-child notification is-dark"
          >
            <p class="title">
              Study Timer
            </p>
            <p class="subtitle">
              Work/study with the Pomodoro timer to keep you focused and
              motivated!
            </p>
          </router-link>
        </div>
        <div class="tile is-parent is-vertical">
          <router-link
            tag="article"
            :to="{ name: 'quick-links' }"
            class="tile is-child notification is-link"
          >
            <p class="title">
              Quick Links
            </p>
            <p class="subtitle">
              Student curated list of useful RPI related links!
            </p>
          </router-link>
          <router-link
            tag="article"
            :to="{ name: 'academic-utils' }"
            class="tile is-child notification is-info"
          >
            <p class="title">
              Grade Calculators
            </p>
            <p class="subtitle">
              Calculate your GPA and estimate your course grades!
            </p>
          </router-link>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'ToolsPage'
};
</script>

<style lang="scss" scoped>
.tile {
  cursor: pointer;
}
</style>
