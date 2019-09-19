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
        {{ studentCount }} total
        <b-button
          :loading="loading"
          @click="getPageContents"
        >Refresh</b-button>
      </small>
    </h2>

    <AdminStudentListPagination
      :total-items="studentCount"
      :per-page="parseInt(itemsPerPage)"
      :current-page="page"
      class="block"
      @change-item-count="changeItemPerPageCount"
      @go-to-page="goToPage"
    />

    <b-table
      ref="table"
      :data="studentsOnPage"
      detailed
      detail-key="rcs_id"
      :row-class="rowClass"
      class="clear-float-right block"
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
          field="graduationYear"
          label="Graduation Year"
        >
          {{ props.row.graduationYear || '---' }}
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

    <AdminStudentListPagination
      :total-items="studentCount"
      :per-page="parseInt(itemsPerPage)"
      :current-page="page"
      class="block"
      @change-item-count="changeItemPerPageCount"
      @go-to-page="goToPage"
    />
  </div>
</template>

<script>
import AdminStudentListOverview from '@/views/admin/components/AdminStudentListOverview.vue'
import AdminStudentListPagination from '@/views/admin/components/AdminStudentListPagination.vue'
export default {
  name: 'AdminStudentList',
  components: { AdminStudentListOverview, AdminStudentListPagination },
  data () {
    return {
      loading: true,
      studentsOnPage: [],
      studentCount: 0,
      page: 1,
      itemsPerPage: 25,
      pageCount: 1
    }
  },
  async created () {
    await this.getPageContents()
  },
  methods: {
    toggle (row) {
      this.$refs.table.toggleDetails(row)
    },
    rowClass (row, index) {
      if (row.admin) return 'has-background-primary'
      if (row.accountLocked) return 'has-background-warning'
    },
    async getPageContents () {
      this.loading = true
      let request
      try {
        request = await this.$http.get('/students', {
          params: { page: this.page, itemsPerPage: this.itemsPerPage }
        })
      } catch (e) {
        this.$buefy.toast.open({
          message: e.response.data.message,
          type: 'is-danger'
        })
        this.studentsOnPage = []
        this.loading = false
        return
      }

      this.studentsOnPage = request.data.students
      this.studentCount = request.data.studentCount
      this.pageCount = Math.ceil(this.studentCount / this.itemsPerPage)

      this.loading = false
    },
    async changeItemPerPageCount (count) {
      this.itemsPerPage = count // fixme - See comment in AdminStudentListPagination
      this.getPageContents()
    },
    async goToPage (page) {
      this.page = page // fixme - See comment in AdminStudentListPagination
      this.getPageContents()
    },
    updatedStudent (student) {
      Object.assign(this.studentsOnPage.find(s => s._id === student._id), student)
    },
    deletedStudent (studentID) {
      this.studentsOnPage = this.studentsOnPage.filter(s => s._id !== studentID)
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
