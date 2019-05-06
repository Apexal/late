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
          @click="$emit('refresh-students')"
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
          @update-student="$emit('update-student', arguments[0])"
          @delete-student="$emit('delete-student', arguments[0])"
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
  props: {
    loading: {
      type: Boolean,
      required: true
    },
    sortBy: {
      type: String,
      required: true
    },
    sortAscending: {
      type: Boolean,
      required: true
    },
    students: {
      type: Array,
      required: true
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
