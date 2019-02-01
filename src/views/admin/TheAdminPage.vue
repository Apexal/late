<template>
  <section
    id="admin-page"
    class="section"
  >
    <h1 class="title">
      Administrator Control Panel
    </h1>
  </section>
</template>

<script>
export default {
  name: 'TheAdminPage',
  data () {
    return {
      users: []
    };
  },
  async created () {
    await this.getUsers();
  },
  methods: {

    async getUsers () {
      this.users = [];
    }
  }
};
</script>

<style lang="scss" scoped>

</style>
