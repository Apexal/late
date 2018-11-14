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
        aria-label="main navigation"
      >
        <div class="navbar-brand">
          <a
            :class="{'is-active': navbarExpanded}"
            role="button"
            class="navbar-burger burger"
            aria-label="menu"
            aria-expanded="false"
            data-target="top-navbar"
            @click="$store.commit('TOGGLE_NAVBAR')"
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </a>
        </div>

        <div
          id="top-navbar"
          :class="{'is-active': navbarExpanded}"
          class="navbar-menu"
        >
          <div class="navbar-start">
            <router-link
              class="navbar-item"
              to="/dashboard"
            >
              <span class="icon">
                <i class="fas fa-home" />
              </span>
              Dashboard</router-link>
            <router-link
              class="navbar-item"
              to="/about"
            >About</router-link>

            <template v-if="loggedIn">
              <div class="navbar-item has-dropdown is-hoverable">
                <a class="navbar-link">
                  <span class="icon">
                    <i class="fas fa-clipboard-list" />
                  </span>
                  Assignments
                  <span class="tag is-warning assignment-count">{{ assignmentCount }}</span>
                </a>

                <div class="navbar-dropdown">
                  <router-link
                    class="navbar-item"
                    to="/assignments"
                  >
                    List
                  </router-link>
                  <hr class="navbar-divider">
                  <a
                    class="navbar-item"
                    @click="$store.commit('TOGGLE_ADD_ASSIGNMENT_MODAL')"
                  >
                    Add Assignment
                  </a>
                </div>
              </div>
            </template>
          </div>

          <div class="navbar-end">
            <template v-if="loggedIn">
              <router-link
                class="navbar-item"
                to="/profile"
              >
                Logged in as <b class="rcs_id">{{ user.display_name }}</b>
              </router-link>
              <a
                class="navbar-item"
                href="/auth/logout"
              >Logout</a>
            </template>
            <a
              v-else
              class="navbar-item"
              href="/auth/login"
            ><b>Login</b></a>

          </div>
        </div>
      </nav>
    </div>
  </header>
</template>

<script>
export default {
  name: 'Header',
  data () {
    return {
    };
  },
  computed: {
    navbarExpanded () { return this.$store.state.navbarExpanded; },
    user () {
      return this.$store.state.auth.user;
    },
    loggedIn () {
      return this.$store.state.auth.isAuthenticated;
    },
    assignmentCount () {
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
  a.navbar-item {
    span.icon {
      margin-right: 3px;
    }
  }

  span.tag.assignment-count {
    padding-left: 5px;
    padding-right: 5px;
    margin-left: 4px;
  }
}
</style>
