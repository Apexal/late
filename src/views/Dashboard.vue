<template>
  <div class="dasboard">
    <ul>
      <li
        v-for="a in assignments"
        :key="a._id"
        class="box">
        <b>{{ a.title }}</b>
        <blockquote>
          <p>{{ a.description }}</p>
        </blockquote>
      </li>
    </ul>
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
  data() {
    return {};
  },
  computed: {
    assignments() {
      return this.$store.state.work.assignments;
    }
  }
};
</script>

<style lang='scss' scoped>
</style>
