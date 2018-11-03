<template>
  <header id="header">
    <section class="hero is-dark">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">LATE</h1>
          <h2 class="subtitle">Lazy Automatic Time Evaluator</h2>
        </div>
      </div>


    </section>
    <div class="hero-foot">
      <nav
        class="navbar is-dark"
        role="navigation"
        aria-label="main navigation">
        <div class="navbar-brand">
          <a
            role="button"
            class="navbar-burger burger"
            aria-label="menu"
            aria-expanded="false"
            data-target="top-navbar">
            <span aria-hidden="true"/>
            <span aria-hidden="true"/>
            <span aria-hidden="true"/>
          </a>
        </div>

        <div
          id="top-navbar"
          class="navbar-menu container">
          <div class="navbar-start">
            <li class="navbar-item">
              <router-link to="/dashboard">Dashboard</router-link>
            </li>

            <li class="navbar-item">
              <router-link to="/about">About</router-link>
            </li>

            <!--
            <div class="navbar-item has-dropdown is-hoverable">
              <a class="navbar-link">
                More
              </a>


              <div class="navbar-dropdown">
                <a class="navbar-item">
                  Dropdown
                </a>

                <a class="navbar-item">
                  Contact
                </a>
                <hr class="navbar-divider">
                <a class="navbar-item">
                  Report an issue
                </a>
              </div>
            </div>
            -->
          </div>

          <div class="navbar-end">
            <template v-if="loggedIn">
              <a class="navbar-item">Logged in as <b class="rcs_id">{{ user.rcs_id }}</b></a>
              <a
                class="navbar-item"
                href="/auth/logout">Logout</a>
            </template>
            <a
              v-else
              class="navbar-item"
              href="/auth/login"><b>Login</b></a>

          </div>
        </div>
      </nav>
    </div>
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
      return this.$store.state.auth.isAuthenticated;
    }
  }
};
</script>

<style lang="scss" scoped>
.rcs_id {
  margin-left: 5px;
}

#top-navbar {
  li.navbar-item {
    a {
      color: inherit;
    }

    &:hover {
      a {
        color: black;
      }
      background-color: white;
    }
  }
}
</style>
