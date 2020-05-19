<!--Admin: Student list module-->
<template>
  <div class="admin-user-list">
    <b-loading
      :is-full-page="true"
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
    <b-field grouped>
      <b-input
        v-model="searchTerm"
        type="text"
        placeholder="Search..."
        class="block"
        expanded
        icon="search"
        maxlength="1000"
        @input="searchChanged"
      />
      <b-tooltip
        :label="getSearchTooltip()"
        class="search-tooltip"
        multilined
        animated
        type="is-dark"
        position="is-left"
      >
        <b-button
          icon-right="question"
        />
      </b-tooltip>
    </b-field>

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

const defaultItemsPerPage = 25
const requiredTimeBeforeSearch = 300 // Number of ms required without change in the search before executing the search

export default {
  name: 'AdminStudentList',
  components: { AdminStudentListOverview, AdminStudentListPagination },
  data () {
    return {
      loading: true,
      studentsOnPage: [],
      studentCount: 0,
      page: Math.max(1, parseInt(this.$route.params.page)), // Pull page from the path params
      itemsPerPage: (typeof this.$route.query.count === 'string' // Pull the items per page count from query string
        ? Math.max(1, parseInt(this.$route.query.count)) : defaultItemsPerPage),
      pageCount: 1,
      searchTimeoutId: null, // Timeout ID for the search timer. Search is on a timer to wait for user to stop typing
      searchTerm: this.$route.query.search || ''
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
    /**
     * Fetches the latest subset of users to display in the list, along with
     * the total number of users registered. Only the users that need to be
     * displayed (given page, item count, search terms, etc.) will be fetched.
     * This method will also refresh pageCount and then re-render the table.
     */
    async getPageContents () {
      this.loading = true
      let request
      try {
        request = await this.$http.get('/students', {
          params: { page: this.page, itemsPerPage: this.itemsPerPage, search: this.searchTerm }
        })
      } catch (e) {
        this.showError(e.response.data.message)
        this.studentsOnPage = []
        this.loading = false
        return
      }

      this.studentsOnPage = request.data.students
      this.studentCount = request.data.studentCount
      this.pageCount = Math.max(Math.ceil(this.studentCount / this.itemsPerPage), 1)

      this.loading = false
    },
    /**
     * Changes the number of items to be displayed on each page
     * Should also switch the current page to the new page containing the user that
     * was previously at the top of the list. This method will also alter the route
     * to contain the new count in the query string. Once changed, the table will be
     * re-rendered.
     * @param count {number} Number of items that should exist per page. Should be
     * an integer greater than or equal to 1.
     * @returns {Promise<void>}
     */
    async changeItemPerPageCount (count) {
      this.itemsPerPage = count
      const query = { ...this.$route.query }

      if (parseInt(count) !== defaultItemsPerPage) {
        query.count = count
      } else {
        delete query.count
      }

      await this.$router.push({ name: 'admin-student-list', params: this.$route.params, query: query })
      this.getPageContents()
    },
    /**
     * Switch the currently displayed page in the user list to the page provided. This
     * method will also alter the current route to the new page number. Once changed,
     * the table will be re-rendered.
     * @param page {number} The page to switch to. Should be an integer greater than or
     * equal to 1.
     * @returns {Promise<void>}
     */
    async goToPage (page) {
      this.page = Math.max(page, 1)
      await this.$router.push({ name: 'admin-student-list', params: { page: this.page }, query: this.$route.query })
      this.getPageContents()
    },
    /**
     * Changes the current search term. Pass an empty string to remove any search.
     * This method also modifies the query string and re-renders/fetches the table.
     * @param searchTerm {string} Entirety of the search string. Will be parsed by backend.
     */
    async searchChanged (searchTerm) {
      if (this.searchTimeoutId != null) {
        clearTimeout(this.searchTimeoutId)
      }

      this.searchTimeoutId = setTimeout(async () => {
        this.searchTimeoutId = null
        this.searchTerm = searchTerm

        const query = { ...this.$route.query }
        if (searchTerm) {
          query.search = searchTerm
        } else {
          delete query.search
        }

        await this.$router.push({ name: 'admin-student-list', params: this.$route.params, query: query })

        this.getPageContents()
      }, requiredTimeBeforeSearch)
    },
    /**
     * Get the contents to be displayed in the tooltip next to the search bar
     */
    getSearchTooltip () {
      return 'Available filters:\n' +
        'is:admin\n' +
        'is:locked\n' +
        'year:####\n' +
        '\n' +
        'Prepend ! to negate any filter.'
    },
    /**
     * Searches the list of students for a student object with the same ID. Once found,
     * that object is updated/replaced with the new student object, which should be
     * considered to have more up-to-date information.
     * Triggered when a user is updated to be made Admin or removed from the
     * wait-list, for example.
     * @param student The new student object. The _id property should exist.
     */
    updatedStudent (student) {
      Object.assign(this.studentsOnPage.find(s => s._id === student._id), student)
    },
    /**
     * Should be used to notify the list that the student with the ID passed has been
     * deleted and should be removed from the list.
     * @param studentID ID of the student to delete from the list.
     */
    deletedStudent (studentID) {
      this.studentsOnPage = this.studentsOnPage.filter(s => s._id !== studentID)
    }
  }
}
</script>

<style lang="scss" scoped>
  .search-tooltip.b-tooltip:after { /* Allows line breaks in tooltip */
    white-space: pre;
  }
</style>
