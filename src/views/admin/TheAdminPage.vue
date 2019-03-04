<template>
  <section
    id="admin-page"
    class="section"
  >
    <h1 class="title">
      Administrator Control Panel
    </h1>
    <AdminStudentList
      :loading="loadingStudents"
      :students="students"
      :sort-by="sortBy"
      :sort-ascending="sortAscending"
      @sort-by="sortBy = $event"
      @sort-ascending="sortAscending = $event"
      @refresh-students="getStudents()"
      @update-student="updatedStudent"
      @delete-student="deletedStudent"
    />
  </section>
</template>

<script>
import AdminStudentList from '@/views/components/admin/AdminStudentList';

export default {
  name: 'TheAdminPage',
  components: { AdminStudentList },
  data () {
    return {
      loadingStudents: true,
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
      this.loadingStudents = true;
      let request;
      try {
        request = await this.$http.get('/students');
      } catch (e) {
        this.$toasted.error(e.response.data.message);
        this.students = [];
        this.loadingStudents = false;
        return;
      }

      this.students = request.data.students;
      this.sortStudents();
      this.loadingStudents = false;
    },
    updatedStudent (student) {
      Object.assign(this.students.find(s => s._id === student._id), student);
    },
    deletedStudent (studentID) {
      this.students = this.students.filter(s => s._id !== studentID);
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
