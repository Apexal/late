<template>
  <header id="header">
    <section class="hero is-dark">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">LATE</h1>
          <h2 class="subtitle">Lazy Automatic Time Evaluator</h2>
        </div>
      </div>

      <div class="hero-foot">
        <nav class="tabs">
          <div class="container">
            <ul>
              <template v-if="loggedIn">
                <li>
                  <a>Logged in as <b class="rcs_id">{{ user.rcs_id }}</b></a>
                </li>
                <li>
                  <a href="/auth/logout">Logout</a>
                </li>
              </template>
              <li v-else><a href="/auth/login">Login</a></li>
            </ul>
          </div>
        </nav>
      </div>
    </section>
  </header>
</template>

<script>
export default {
  name: 'Header',
  computed: {
    user() {
      return this.$store.state.auth.user;
    },
    loggedIn() {
      return this.$store.getters.isAuthenticated;
    }
  }
};
</script>

<style lang="scss" scoped>
.rcs_id {
  margin-left: 5px;
}
</style>
