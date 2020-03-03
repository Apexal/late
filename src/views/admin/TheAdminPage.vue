<!--Admin: Main administration page-->
<template>
  <section
    id="admin-page"
    class="section"
  >
    <h1 class="is-hidden-desktop has-text-centered is-marginless title">
      Administration
    </h1>
    <div class="tabs is-centered">
      <ul>
        <h1
          class="is-hidden-touch title"
          style="flex: 1"
        >
          Administration
        </h1>
        <router-link
          :to="{name: 'admin-student-list', params: {page: 1}}"
          tag="li"
        >
          <a>Students</a>
        </router-link>
        <router-link
          :to="{name: 'admin-log'}"
          tag="li"
        >
          <a>Server Log</a>
        </router-link>
        <router-link
          :to="{name: 'admin-terms'}"
          tag="li"
        >
          <a>School Terms</a>
        </router-link>
        <router-link
          :to="{name: 'admin-fun'}"
          tag="li"
        >
          <a>Fun</a>
        </router-link>
        <router-link
          :to="{name: 'admin-poll'}"
          tag="li"
        >
          <a>Polls</a>
        </router-link>
        <router-link
          :to="{name: 'admin-development'}"
          tag="li"
        >
          <a>Dev Mode</a>
        </router-link>
      </ul>
    </div>

    <router-view />
  </section>
</template>

<script>
export default {
  name: 'TheAdminPage'
}
</script>

<style lang="scss" scoped>

</style>
