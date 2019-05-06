<template>
  <section
    id="admin-page"
    class="section"
  >
    <div class="tabs">
      <ul>
        <li
          :class="{ 'is-active': tab === 'users' }"
          @click="tab = 'users'"
        >
          <a>Users</a>
        </li>
        <li
          :class="{ 'is-active': tab === 'log' }"
          @click="tab = 'log'"
        >
          <a>Log</a>
        </li>
      </ul>
    </div>

    <h1 class="title">
      Administrator Control Panel
    </h1>
    <AdminStudentList
      v-if="tab === 'users'"
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
    <div
      v-else-if="tab === 'log'"
      class="server-log content"
    >
      <h2 class="subtitle">
        Server Log
      </h2>
      <button
        class="button is-pulled-right"
        :class="{ 'is-loading': loadingLog }"
        @click="getLog"
      >
        Refresh
      </button>
      <blockquote>
        <b-loading
          :is-full-page="false"
          :active="loadingLog"
          :can-cancel="false"
        />
        <ul>
          <li
            v-for="line in log"
            :key="line"
          >
            {{ line }}
          </li>
        </ul>
      </blockquote>
    </div>
  </section>
</template>

<script>
import AdminStudentList from '@/views/components/admin/AdminStudentList';

export default {
  name: 'TheAdminPage',
  components: { AdminStudentList },
  data () {
    return {
      tab: 'users',
      log: [],
      loadingLog: true,
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
    await this.getLog();
  },
  methods: {
    async getLog () {
      this.loadingLog = true;
      let request;
      try {
        request = await this.$http.get('/students/log');
      } catch (e) {
        this.$toasted.error('Failed to load server log.');
        this.log = [];
        this.loadingLog = false;
        return;
      }

      this.log = request.data.log.reverse();
      this.loadingLog = false;
    },
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
