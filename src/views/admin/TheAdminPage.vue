<template>
  <section
    id="admin-page"
    class="section"
  >
    <h1 class="title">
      Administrator Control Panel
    </h1>
    <AdminUserList :students="students" />
  </section>
</template>

<script>
import AdminUserList from '@/components/admin/AdminUserList';

export default {
  name: 'TheAdminPage',
  components: { AdminUserList },
  data () {
    return {
      sortBy: 'joined_date',
      students: []
    };
  },
  watch: {
    sortBy (newSortBy) {
      this.students.sort((s1, s2) => {
        if (s1[newSortBy] < s2[newSortBy]) return -1;
        if (s1[newSortBy] > s2[newSortBy]) return 1;
        return 0;
      });
    }
  },
  async created () {
    await this.getStudents();
  },
  methods: {
    async getStudents () {
      let request;
      request = await this.$http.get('/students');

      this.students = request.data.students.sort((s1, s2) => {
        if (s1[this.sortBy] < s2[this.sortBy]) return -1;
        if (s1[this.sortBy] > s2[this.sortBy]) return 1;
        return 0;
      });
    }
  }
};
</script>

<style lang="scss" scoped>

</style>
