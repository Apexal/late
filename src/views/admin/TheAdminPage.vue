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
    <div
      v-else-if="tab === 'log'"
      class="server-log content"
    >
      <h2 class="subtitle">
        Server Log
      </h2>
      <b-button
        class="is-pulled-right"
        :loading="loadingLog"
        @click="getLog"
      >
        Refresh
      </b-button>
      <blockquote>
        <b-loading
          :is-full-page="false"
          :active="loadingLog"
          :can-cancel="false"
        />
        <ul>
          <li
            v-for="line in log"
            :key="line"
          >
            {{ line }}
          </li>
        </ul>
      </blockquote>
    </div>
  </section>
</template>

<script>
import AdminStudentList from '@/views/components/admin/AdminStudentList';

export default {
  name: 'TheAdminPage',
  components: { AdminStudentList },
  data () {
    return {
      tab: 'users',
      log: [],
      loadingLog: true
    };
  },
  async created () {
    await this.getLog();
  },
  methods: {
    async getLog () {
      this.loadingLog = true;
      let request;
      try {
        request = await this.$http.get('/students/log');
      } catch (e) {
        this.$toasted.error('Failed to load server log.');
        this.log = [];
        this.loadingLog = false;
        return;
      }

      this.log = request.data.log.reverse();
      this.loadingLog = false;
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
