<!--Admin: Main administration page-->
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
        <router-link
          :to="{ name: 'admin-student-list' }"
          tag="li"
        >
          <a>Students</a>
        </router-link>
        <router-link
          :to="{ name: 'admin-log' }"
          tag="li"
        >
          <a>Server Log</a>
        </router-link>
        <router-link
          :to="{ name: 'admin-terms' }"
          tag="li"
        >
          <a>School Terms</a>
        </router-link>
      </ul>
    </div>

    <router-view />
  </section>
</template>

<script>
import AdminStudentList from '@/views/admin/components/AdminStudentList';
import AdminLog from '@/views/admin/components/AdminLog';

export default {
  name: 'TheAdminPage',
  components: { AdminStudentList, AdminLog }
};
</script>

<style lang="scss" scoped>
h1.title {
  margin: 0;
}
</style>
