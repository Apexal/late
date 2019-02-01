<template>
  <div class="admin-user-list">
    <h2 class="subtitle">
      User List
      <small class="is-pulled-right has-text-grey">
        {{ students.length }} total
      </small>
    </h2>

    <label
      for="sort-by"
      class="label"
    >
      Sort By
    </label>
    <div class="field has-addons">
      <div class="control is-expanded">
        <div class="select is-fullwidth">
          <select
            id="sort-by"
            :value="sortBy"

            @change="$emit('sort-by', $event.target.value)"
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
          @click="$emit('sort-ascending', !sortAscending)"
        >
          {{ sortAscending ? 'Ascending' : 'Descending' }}
        </a>
      </div>
    </div>
    <div class="users columns is-multiline">
      <div
        v-for="student in students"
        :key="student._id"
        class="column is-half"
      >
        <AdminStudentListOverview :student="student" />
      </div>
    </div>
  </div>
</template>

<script>
import AdminStudentListOverview from '@/components/admin/AdminStudentListOverview.vue';
export default {
  name: 'AdminStudentList',
  components: { AdminStudentListOverview },
  props: ['sortBy', 'sortAscending', 'students']

};
</script>

<style lang="scss" scoped>

</style>
