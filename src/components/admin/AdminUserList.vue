<template>
  <div class="admin-user-list">
    <h2 class="subtitle">
      User List
    </h2>

    <div class="users columns is-multiline">
      <div
        v-for="student in students"
        :key="student._id"
        class="column is-half"
      >
        <div class="box user">
          {{ student.display_name }}
          <a
            class="has-text-grey"
            :href="'mailto:' + student.rcs_id + '@rpi.edu'"
          >
            {{ student.rcs_id + '@rpi.edu' }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminUserList',
  props: ['students']

};
</script>

<style lang="scss" scoped>

</style>
