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
            <router-link
              class="navbar-item"
              to="/dashboard">Dashboard</router-link>
            <router-link
              class="navbar-item"
              to="/about">About</router-link>

            <template v-if="loggedIn">
              <div class="navbar-item has-dropdown is-hoverable">
                <a class="navbar-link">
                  Assignments
                  <span class="tag is-warning assignment-count">{{ assignmentCount }}</span>
                </a>

                <div class="navbar-dropdown">
                  <router-link
                    class="navbar-item"
                    to="/assignments">
                    List
                  </router-link>

                  <a class="navbar-item">
                    Contact
                  </a>
                  <hr class="navbar-divider">
                  <a class="navbar-item">
                    Report an issue
                  </a>
                </div>
              </div>
            </template>

          </div>

          <div class="navbar-end">
            <template v-if="loggedIn">
              <router-link
                class="navbar-item"
                to="/profile">
                Logged in as <b class="rcs_id">{{ user.display_name }}</b>
              </router-link>
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
    },
    assignmentCount() {
      return this.$store.state.work.assignments.length;
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

  span.tag.assignment-count {
    padding-left: 5px;
    padding-right: 5px;
    margin-left: 4px;
  }
}
</style>
