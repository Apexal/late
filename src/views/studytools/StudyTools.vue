<template>
  <div class="study-tools">
    <section class="section">
      <h1 class="title">
        Study Tools
      </h1>

      <transition
        name="slide-left"
        mode="out-in"
      >
        <router-view
          class="child-view"
        />
      </transition>
    </section>
  </div>
</template>

<script>
export default {
  name: 'StudyTools'
};
</script>

<style lang="scss" scoped>

</style>
