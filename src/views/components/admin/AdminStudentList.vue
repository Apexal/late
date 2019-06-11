<!--Admin: Student list module-->
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

    <b-table
      ref="table"
      :data="students"
      detailed
      detail-key="rcs_id"
      :row-class="rowClass"
    >
      <template slot-scope="props">
        <b-table-column
          field="rcs_id"
          label="RCS ID"
          width="40"
        >
          <a @click="toggle(props.row)">{{ props.row.rcs_id }}</a>
        </b-table-column>

        <b-table-column
          field="name.first"
          label="First Name"
        >
          <span v-if="props.row.name">{{ props.row.name.first || '---' }}</span>
          <span v-else>---</span>
        </b-table-column>

        <b-table-column
          field="name.last"
          label="Last Name"
        >
          <span v-if="props.row.name">{{ props.row.name.last || '---' }}</span>
          <span v-else>---</span>
        </b-table-column>

        <b-table-column
          field="grad_year"
          label="Graduation Year"
        >
          {{ props.row.grad_year || '---' }}
        </b-table-column>
      </template>

      <template
        slot="detail"
        slot-scope="props"
      >
        <AdminStudentListOverview
          :student="props.row"
          @update-student="updatedStudent"
          @delete-student="deletedStudent"
        />
      </template>
    </b-table>
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
    toggle (row) {
      this.$refs.table.toggleDetails(row);
    },
    rowClass (row, index) {
      if (row.admin) return 'has-background-primary';
      if (row.accountLocked) return 'has-background-warning';
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
      this.loading = true;
      let request;
      try {
        request = await this.$http.get('/students');
      } catch (e) {
        this.$toast.open({
          message: e.response.data.message,
          type: 'is-danger'
        });
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
