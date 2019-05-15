<template>
  <section
    id="admin-page"
    class="section"
  >
    <div class="tabs is-right">
      <ul>
        <h1
          class="title"
          style="flex: 1 1 0%;"
        >
          Administrator Control Panel
        </h1>
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

    <AdminStudentList
      v-if="tab === 'users'"
    />
    <AdminLog
      v-else-if="tab === 'log'"
    />
  </section>
</template>

<script>
import AdminStudentList from '@/views/components/admin/AdminStudentList';
import AdminLog from '@/views/components/admin/AdminLog';

export default {
  name: 'TheAdminPage',
  components: { AdminStudentList, AdminLog },
  data () {
    return {
      tab: 'users'
    };
  }
};
</script>

<style lang="scss" scoped>
</style>
