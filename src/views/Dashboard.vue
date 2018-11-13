<template>
  <section class="section dasboard">
    <h1 class="title">Coming soon...</h1>
  </section>
</template>

<script>
export default {
  name: 'Dashboard',
  data () {
    return {};
  },
  computed: {
    assignments () {
      return this.$store.state.work.assignments;
    }
  }
};
</script>

<style lang='scss' scoped>
</style>
