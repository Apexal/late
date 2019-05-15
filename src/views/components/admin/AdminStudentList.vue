<template>
  <div class="admin-user-list">
    <b-loading
      :is-full-page="false"
      :active="loading"
      :can-cancel="false"
    />
    <h2 class="subtitle">
      User List
      <small class="is-pulled-right has-text-grey">
        {{ students.length }} total
        <b-button
          :loading="loading"
          @click="getStudents"
        >Refresh</b-button>
      </small>
    </h2>

    <label
      for="sort-by"
      class="label"
    >Sort By</label>
    <div class="field has-addons">
      <div class="control is-expanded">
        <div class="select is-fullwidth">
          <select
            id="sort-by"
            v-model="sortBy"
          >
            <option value="last_login">
              Last Login
            </option>
            <option value="joined_date">
              Date Joined
            </option>
            <option value="rcs_id">
              Username
            </option>
            <option value="grad_year">
              Class
            </option>
          </select>
        </div>
      </div>
      <div class="control">
        <a
          class="button"
          @click="sortAscending = !sortAscending"
        >{{ sortAscending ? 'Ascending' : 'Descending' }}</a>
      </div>
    </div>
    <div class="users columns is-multiline">
      <div
        v-for="student in students"
        :key="student._id"
        class="column is-half"
      >
        <AdminStudentListOverview
          :student="student"
          @update-student="updatedStudent"
          @delete-student="deletedStudent"
        />
      </div>
    </div>
  </div>
</template>

<script>
import AdminStudentListOverview from '@/views/components/admin/AdminStudentListOverview.vue';
export default {
  name: 'AdminStudentList',
  components: { AdminStudentListOverview },
  data () {
    return {
      loading: true,
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
      this.loading = true;
      let request;
      try {
        request = await this.$http.get('/students');
      } catch (e) {
        this.$toasted.error(e.response.data.message);
        this.students = [];
        this.loading = false;
        return;
      }

      this.students = request.data.students;
      this.sortStudents();
      this.loading = false;
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
