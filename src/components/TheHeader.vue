<template>
  <header
    id="header"
    ref="header"
  >
    <section class="hero is-dark">
      <div class="hero-body">
        <h1 class="title">
          <router-link to="/dashboard">
            LATE
          </router-link>
          <span
            class="tag is-primary beta-tag"
            title="LATE is still in active development!"
          >
            BETA
          </span>
        </h1>
        <h2 class="subtitle">
          <router-link to="/dashboard">
            Lazy Automatic Time Evaluator
          </router-link>
        </h2>
      </div>
    </section>
    <div
      ref="navbar"
      class="hero-foot"
    >
      <nav
        class="navbar is-dark"
        role="navigation"
        aria-label="main navigation"
      >
        <div class="navbar-brand">
          <a
            id="logo"
            class="navbar-item"
            href="#"
          >
            LATE
          </a>

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
              Dashboard
            </router-link>

            <router-link
              v-if="user.admin"
              class="navbar-item"
              to="/admin"
              title="View the administrator page."
            >
              <span class="icon">
                <i class="fas fa-user-lock" />
              </span>
              Administrators
            </router-link>

            <template v-if="loggedIn">
              <div
                v-if="!onBreak"
                class="navbar-item has-dropdown is-hoverable"
              >
                <a class="navbar-link">
                  <span class="icon">
                    <i class="fas fa-clipboard-list" />
                  </span>
                  Assignments
                  <span
                    v-if="assignmentCount > 0"
                    class="tag is-warning assignment-count"
                  >
                    {{ assignmentCount }}
                  </span>
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
                    Previous
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

              <div
                v-if="!onBreak"
                class="navbar-item has-dropdown is-hoverable"
              >
                <a class="navbar-link">
                  <span class="icon">
                    <i class="fas fa-file-alt" />
                  </span>
                  Exams
                  <span
                    v-if="examCount > 0"
                    class="tag is-danger exam-count"
                  >
                    {{ examCount }}
                  </span>
                </a>

                <div class="navbar-dropdown">
                  <router-link
                    class="navbar-item"
                    to="/exams/upcoming"
                    title="View upcoming exams."
                  >
                    <b>Upcoming</b>
                  </router-link>
                  <router-link
                    class="navbar-item"
                    to="/exams/past"
                    title="Browse all past exams."
                  >
                    Previous
                  </router-link>
                  <router-link
                    class="navbar-item"
                    to="/exams/calendar"
                    title="View a calendar of all your exams."
                  >
                    Calendar
                  </router-link>
                  <hr class="navbar-divider">
                  <a
                    class="navbar-item"
                    title="Add a new exam."
                    @click="$store.commit('TOGGLE_ADD_EXAM_MODAL')"
                  >
                    <span class="icon">
                      <i class="fas fa-plus" />
                    </span>
                    Add Exam
                  </a>
                </div>
              </div>
            </template>
          </div>

          <div class="navbar-end">
            <template v-if="loggedIn">
              <div class="navbar-item has-dropdown is-hoverable">
                <a class="navbar-link">
                  <span class="icon">
                    <i class="fas fa-user-circle" />
                  </span>
                  {{ user.display_name }}
                </a>

                <div class="navbar-dropdown is-right">
                  <router-link
                    class="navbar-item"
                    to="/profile"
                    title="Edit your profile."
                  >
                    <i
                      data-v-203ae283
                      class="fas fa-pencil-alt"
                      style="margin-right: 10px"
                    />
                    Edit Account
                  </router-link>
                  <a
                    class="navbar-item"
                    href="/auth/logout"
                  >
                    <span class="icon">
                      <i class="fas fa-sign-out-alt" />
                    </span>
                    Log out
                  </a>
                </div>
              </div>
            </template>
            <a
              v-else
              class="navbar-item"
              href="/auth/login"
              title="Login to LATE with RPI CAS."
            >
              <b>Log in</b>
            </a>
          </div>
        </div>
      </nav>
    </div>
  </header>
</template>

<script>
export default {
  name: 'TheHeader',
  data () {
    return {};
  },
  computed: {
    onBreak () {
      return this.$store.getters.onBreak;
    },
    navbarExpanded () {
      return this.$store.state.navbarExpanded;
    },
    user () {
      return this.$store.state.auth.user;
    },
    loggedIn () {
      return this.$store.state.auth.isAuthenticated;
    },
    assignmentCount () {
      return this.$store.getters.incompleteUpcomingAssignments.length;
    },
    examCount () {
      return this.$store.state.work.upcomingExams.length;
    }
  },
  mounted () {
    const header = this.$refs.header;
    const offset = this.$refs.navbar.offsetTop;

    window.addEventListener('scroll', () => {
      if (window.pageYOffset >= offset) {
        header.classList.add('sticky');
      } else {
        header.classList.remove('sticky');
      }
    });
  }
};
</script>

<style lang="scss" scoped>
.rcs_id {
  margin-left: 5px;
}

.hero-body {
  padding-bottom: 24px;
  padding-top: 24px;
}

.beta-tag {
  margin-left: 5px;
}

.no-margin-left {
  margin-left: 0;
}

#top-navbar {
  //Pushes the left and right navbar menus slightly off the edges of the screen.
  padding: 0;
  padding-right: 80px;
  transition: padding-right 0.2s;

  .navbar-item {
    span.icon {
      margin-right: 3px;
    }
  }

  span.tag.assignment-count,
  span.tag.exam-count {
    padding-left: 5px;
    padding-right: 5px;
    margin-left: 7px;
  }
}

//Adjusts left margin of title block to a smaller and readable level
.hero-body .container {
  margin: 0 0 0 4em;
}

header.sticky {
  .hero-foot {
    z-index: 10;
    position: fixed;
    top: 0;
    width: 100%;
  }
  margin-bottom: 50px;
  #logo {
    opacity: 1;
  }
  #top-navbar {
    padding-right: 10px;
  }
}

#logo {
  opacity: 0;
  transition: opacity 0.2s;

  font-size: 1.6rem;
  font-weight: 600;
}
</style>
