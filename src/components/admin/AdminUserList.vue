<template>
  <div class="admin-user-list">
    <h2 class="subtitle">
      User List
    </h2>

    <div class="users">
      <div
        v-for="user in users"
        :key="user._id"
        class="box user"
      >
        {{ user.rcs_id }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminUserList',
  props: ['users']
};
</script>

<style lang="scss" scoped>

</style>
