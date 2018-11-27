<template>
  <header id="header">
    <section class="hero is-dark">
      <div class="hero-body">
        <div class="container">
          <h1 class="title">
            LATE
            <span
              class="tag is-primary"
              title="LATE is still in active development!"
            >Beta</span>
          </h1>
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
          class="navbar-menu is-unselectable"
        >
          <div class="navbar-start">
            <router-link
              class="navbar-item"
              to="/dashboard"
              title="View your dashboard."
            >
              <span class="icon">
                <i class="fas fa-home" />
              </span>
              Dashboard</router-link>
            <router-link
              class="navbar-item"
              to="/about"
              title="View information about LATE's mission and its developer team."
            >
              <span class="icon">
                <i class="fas fa-info-circle" />
              </span>
              About
            </router-link>

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
                    to="/assignments/upcoming"
                    title="View upcoming assignments (due in the future)."
                  >
                    <b>Upcoming</b>
                  </router-link>
                  <router-link
                    class="navbar-item"
                    to="/assignments/past"
                    title="Browse all past assignments."
                  >
                    Past
                  </router-link>
                  <router-link
                    class="navbar-item"
                    to="/assignments/calendar"
                    title="View a calendar of all your assignment due dates."
                  >
                    Calendar
                  </router-link>
                  <hr class="navbar-divider">
                  <a
                    class="navbar-item"
                    title="Add a new assignment."
                    @click="$store.commit('TOGGLE_ADD_ASSIGNMENT_MODAL')"
                  >
                    <span class="icon">
                      <i class="fas fa-plus" />
                    </span>
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
                title="Setup your profile."
              >
                <span class="icon">
                  <i class="fas fa-user-circle" />
                </span>
                Logged in as <b class="rcs_id">{{ user.display_name }}</b>
              </router-link>
              <a
                class="navbar-item"
                href="/auth/logout"
              >
                <span class="icon">
                  <i class="fas fa-sign-out-alt" />
                </span>
                Logout
              </a>
            </template>
            <a
              v-else
              class="navbar-item"
              href="/auth/login"
              title="Login to LATE with RPI CAS."
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
      return this.$store.getters.incompleteUpcomingAssignments.length;
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
