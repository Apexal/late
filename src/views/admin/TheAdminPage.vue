<template>
  <section
    id="admin-page"
    class="section"
  >
    <h1 class="title">
      Administrator Control Panel
    </h1>
    <AdminStudentList
      :students="students"
      :sort-by="sortBy"
      :sort-ascending="sortAscending"
      @sort-by="sortBy = $event"
      @sort-ascending="sortAscending = $event"
    />
  </section>
</template>

<script>
import AdminStudentList from '@/components/admin/AdminStudentList';

export default {
  name: 'TheAdminPage',
  components: { AdminStudentList },
  data () {
    return {
      sortBy: 'joined_date',
      sortAscending: true,
      students: []
    };
  },
  watch: {
    sortBy (newSortBy) {
      this.sortStudents();
    },
    sortAscending (newSortAscending) {
      this.sortStudents();
    }
  },
  async created () {
    await this.getStudents();
  },
  methods: {
    sortStudents () {
      this.students.sort((s1, s2) => {
        if (this.sortAscending) {
          if (!s1[this.sortBy]) return -1;
          if (!s2[this.sortBy]) return 1;

          if (s1[this.sortBy] < s2[this.sortBy]) return -1;
          if (s1[this.sortBy] > s2[this.sortBy]) return 1;
        } else {
          if (!s1[this.sortBy]) return 1;
          if (!s2[this.sortBy]) return -1;

          if (s1[this.sortBy] > s2[this.sortBy]) return -1;
          if (s1[this.sortBy] < s2[this.sortBy]) return 1;
        }
        return 0;
      });
    },
    async getStudents () {
      let request;
      try {
        request = await this.$http.get('/students');
      } catch (e) {
        this.$toasted.error(e.response.data.message);
        this.students = [];
        return;
      }

      this.students = request.data.students;
      this.sortStudents();
    }
  }
};
</script>

<style lang="scss" scoped>

</style>
