<template>
  <div id="profile">
    <section class="section">
      <h1 class="title">Your Profile</h1>
      <nav
        class="breadcrumb"
        aria-label="breadcrumbs"
      >
        <ul>
          <router-link
            v-for="s in setups"
            :key="s.component"
            :to="{ path: s.link }"
            tag="li"
          >
            <a>
              {{ s.label }}
              <span class="icon">
                <i
                  v-if="user.setup[s.setup_check]"
                  class="fas fa-check"
                />
                <i
                  v-else
                  class="fas fa-times"
                />
              </span>
            </a>
          </router-link>
        </ul>
      </nav>
      <KeepAlive>
        <router-view />
      </KeepAlive>
    </section>
  </div>
</template>

<script>
export default {
  name: 'Profile',
  data() {
    return {
      setups: [
        { label: 'Personal Info', link: '/profile/personalinfo', setup_check: 'personal_info' },
        { label: 'Course Schedule', link: '/profile/courseschedule', setup_check: 'course_schedule' }
      ]
    };
  },
  computed: {
    user () { return this.$store.state.auth.user; }
  }
};
</script>

<style lang='scss' scoped>
</style>
