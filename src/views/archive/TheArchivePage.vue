<template>
  <section class="section archive">
    <h1 class="title has-text-centered-mobile">
      Archive
    </h1>

    <router-view />
  </section>
</template>

<script>
export default {
  name: 'ArchivePage',
  data () {
    return {
      selectedTerm: ''
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
