<template>
  <header
    id="header"
    ref="header"
  >
    <nav
      class="navbar is-dark is-fixed-top"
      role="navigation"
      aria-label="main navigation"
    >
      <div class="navbar-brand">
        <router-link
          id="logo"
          class="navbar-item"
          to="/dashboard"
          active-class
          exact-active-class
        >
          LATE
          <span
            class="tag is-primary beta-tag"
            title="LATE is still in active development!"
          >BETA</span>
        </router-link>
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
          <template v-if="loggedIn">
            <router-link
              class="navbar-item"
              to="/dashboard"
              title="View your dashboard"
            >
              <span class="icon">
                <i class="fas fa-home" />
              </span>
              Dashboard
            </router-link>

            <div
              v-if="!onBreak"
              class="navbar-item has-dropdown is-hoverable"
            >
              <a
                class="navbar-link"
                title="Manage your assignments and exams!"
              >
                <span class="icon">
                  <i class="fas fa-graduation-cap" />
                </span>
                Coursework
                <span
                  v-if="assessmentCount > 0"
                  class="tag is-warning assignment-count"
                >{{ assessmentCount }}</span>
              </a>

              <div class="navbar-dropdown">
                <router-link
                  class="navbar-item"
                  to="/assessments/upcoming"
                  title="View upcoming assessments"
                >
                  <b>Upcoming</b>
                </router-link>
                <router-link
                  class="navbar-item"
                  to="/assessments/past"
                  title="Browse all past assessments"
                >
                  Previous
                </router-link>
                <router-link
                  class="navbar-item"
                  to="/assessments/calendar"
                  title="View a calendar of all your assessment due dates"
                >
                  Calendar
                </router-link>
                <hr class="navbar-divider">
                <a
                  class="navbar-item"
                  title="Add a new assignment"
                  @click="$store.commit('TOGGLE_ADD_ASSIGNMENT_MODAL')"
                >
                  <span class="icon">
                    <i class="fas fa-plus" />
                  </span>
                  Add Assignment
                </a>
                <a
                  class="navbar-item"
                  title="Add a new exam"
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
            <a
              class="navbar-item"
              :title="announcementsCount + ' new announcements'"
              @click="openAnnouncementsModal"
            >
              <i
                class="fa-bell"
                :class="[ announcementsCount === 0 ? 'far' : 'fas' ]"
              />
            </a>
            <div class="navbar-item has-dropdown is-hoverable">
              <a class="navbar-link">
                <span class="icon">
                  <i
                    class="fas"
                    :title="user.admin ? 'You are an administrator!' : ''"
                    :class="[ user.admin ? 'fa-star' : 'fa-user-circle' ]"
                    :style="user.admin ? 'color:#e5c100' : 'color:#ffffff'"
                  />
                </span>
                {{ user.display_name }}
              </a>

              <div class="navbar-dropdown is-right">
                <router-link
                  v-if="user.admin"
                  class="navbar-item"
                  to="/admin"
                  title="View the administrator page"
                >
                  <span class="icon">
                    <i class="fas fa-user-lock" />
                  </span>
                  Administration
                </router-link>

                <router-link
                  class="navbar-item"
                  to="/profile"
                  title="Edit your profile"
                >
                  <i
                    class="fas fa-pencil-alt"
                    style="margin-right: 10px"
                  />
                  Edit Account
                </router-link>

                <a
                  class="navbar-item"
                  href="https://github.com/Apexal/late/issues/new/choose"
                  target="none"
                  title="Report a bug or request a feature on GitHub"
                >
                  <span class="icon bug-report">
                    <i
                      class="fas fa-bug"
                      style="margin-right: 5px"
                    />
                  </span>
                  Report a bug
                </a>

                <hr class="navbar-divider">

                <a
                  class="navbar-item"
                  href="/auth/logout"
                  title="Sign out of LATE"
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
            title="Login to LATE with RPI CAS"
          >
            <b>Log in</b>
          </a>
        </div>
      </div>
    </nav>
  </header>
</template>

<script>
export default {
  name: 'TheHeader',
  computed: {
    seenAnnouncementIDs () {
      return this.$store.state.announcements.seenIDs;
    },
    announcementsCount () {
      return this.$store.getters.allAnnouncements.filter(
        a => !this.seenAnnouncementIDs.includes(a._id)
      ).length;
    },
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
    assessmentCount () {
      return this.$store.getters.limitedUpcomingAssessments.length;
    }
  },
  methods: {
    openAnnouncementsModal () {
      // Mark all announcements as seen
      localStorage.setItem(
        'seenAnnouncementIDs',
        JSON.stringify(this.$store.getters.allAnnouncements.map(ann => ann._id))
      );

      this.$store.commit(
        'SET_SEEN_ANNOUNCEMENT_IDS',
        this.$store.getters.allAnnouncements.map(ann => ann._id)
      );

      this.$store.commit('SET_ANNOUNCEMENTS_MODEL_OPEN', true);
    }
  }
};
</script>

<style lang="scss" scoped>
.rcs_id {
  margin-left: 5px;
}

.beta-tag {
  margin-left: 5px;
  transition: 0.2s;
  background-color: #70cad1;
  color: white;
  line-height: 1.2em;
}

.has-dropdown .navbar-link::after {
  transition: 0.1s;
}

.has-dropdown:hover .navbar-link::after {
  transform: translateY(3px) rotate(135deg);
  transition: 0.05s;
  -webkit-transition: 0.05s;
}

.has-dropdown:hover .navbar-link::after {
  transition: 0.2s;
  transition-timing-function: ease-out;
}

.navbar-brand:hover .beta-tag {
  background-color: #73dee6 !important;
  transition: 0.2s;
}

.no-margin-left {
  margin-left: 0;
}

#logo {
  font-size: 1.6rem;
  font-weight: 600;
}

#top-navbar {
  //Pushes the left and right navbar menus slightly off the edges of the screen.
  padding: 0;

  .navbar-item {
    span.icon {
      margin-right: 3px;
    }
  }

  span.tag.assignment-count,
  span.tag.exam-count,
  span.tag.announcement-count {
    padding-left: 5px;
    padding-right: 5px;
    margin-left: 7px;
  }
}
</style>
