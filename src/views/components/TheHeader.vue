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
          :to="{ name: 'home' }"
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
          v-if="loggedIn"
          class="navbar-item announcement-icon is-hidden-desktop"
          :title="announcementsCount + ' new announcements'"
          @click="openAnnouncementsModal"
        >
          <span class="icon">
            <i
              class="fa-bell announcement-bell-icon"
              :class="[
                announcementsCount === 0 ? 'far' : 'fas new-announcements'
              ]"
            />
          </span>
        </a>
        <a
          :class="{ 'is-active': navbarExpanded }"
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
        :class="{ 'is-active': navbarExpanded }"
        class="navbar-menu is-unselectable"
      >
        <div class="navbar-start">
          <template v-if="loggedIn">
            <router-link
              class="navbar-item"
              :to="{ name: 'home' }"
              title="View your dashboard"
            >
              <span class="icon">
                <i class="fas fa-home" />
              </span>
              Dashboard
            </router-link>

            <router-link
              v-if="onBreak"
              class="navbar-item"
              :to="{ name: 'about' }"
              title="Learn more about LATE and its creators"
            >
              <span class="icon">
                <i class="fas fa-question-circle" />
              </span>
              About
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
                  :to="{ name: 'coursework-upcoming' }"
                  title="View upcoming assessments"
                >
                  <b>Upcoming</b>
                </router-link>
                <router-link
                  class="navbar-item"
                  :to="{ name: 'coursework-past' }"
                  title="Browse all past assessments"
                >
                  Previous
                </router-link>
                <router-link
                  class="navbar-item"
                  :to="{ name: 'coursework-calendar' }"
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
                    <i class="fas fa-clipboard-check" />
                  </span>
                  Add Assignment
                </a>
                <a
                  class="navbar-item"
                  title="Add a new exam"
                  @click="$store.commit('TOGGLE_ADD_EXAM_MODAL')"
                >
                  <span class="icon">
                    <i class="fas fa-exclamation-triangle" />
                  </span>
                  Add Exam
                </a>
              </div>
            </div>
          </template>
          <template v-else>
            <router-link
              class="navbar-item"
              :to="{ name: 'about' }"
              title="Learn more about LATE and its creators"
            >
              <span class="icon">
                <i class="fas fa-question-circle" />
              </span>
              About
            </router-link>
          </template>
          <router-link
            :to="{ name: 'tools' }"
            class="navbar-item"
            title="Student tools to calculate grades, help you work/study, and more!"
          >
            <span class="icon">
              <i class="fas fa-toolbox" />
            </span>
            Tools
          </router-link>
        </div>

        <div class="navbar-end">
          <template v-if="loggedIn">
            <a
              class="navbar-item announcement-icon is-hidden-touch"
              :title="announcementsCount + ' new announcements'"
              @click="openAnnouncementsModal"
            >
              <span class="icon">
                <i
                  class="fa-bell announcement-bell-icon"
                  :class="[
                    announcementsCount === 0 ? 'far' : 'fas new-announcements'
                  ]"
                />
              </span>
            </a>
            <div class="navbar-item has-dropdown is-hoverable">
              <a
                class="navbar-link"
                style="padding-right: 3.2em;"
              >
                <span class="icon">
                  <i
                    class="fas"
                    :title="user.admin ? 'You are an administrator!' : ''"
                    :class="[user.admin ? 'fa-star' : 'fa-user-circle']"
                    :style="user.admin ? 'color:#e5c100' : 'color:#ffffff'"
                  />
                </span>
                {{ user.display_name }}
              </a>

              <div class="navbar-dropdown is-right">
                <router-link
                  v-if="!onBreak"
                  class="navbar-item"
                  :to="{ name: 'coursework-stats' }"
                  title="View stats on your coursework"
                >
                  <span class="icon">
                    <i class="fas fa-chart-pie" />
                  </span>
                  Your Statistics
                </router-link>
                <hr
                  v-if="!onBreak"
                  class="navbar-divider"
                >
                <router-link
                  v-if="user.admin"
                  class="navbar-item"
                  :to="{ name: 'admin-student-list' }"
                  title="View the administrator page"
                >
                  <span class="icon">
                    <i class="fas fa-user-lock" />
                  </span>
                  Administration
                </router-link>

                <router-link
                  class="navbar-item"
                  to="/account"
                  title="Edit your account"
                >
                  <span class="icon">
                    <i class="fas fa-pencil-alt" />
                  </span>
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
    isUserSetup () {
      return this.$store.getters.isUserSetup;
    },
    navbarExpanded () {
      return this.$store.state.navbarExpanded;
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

@keyframes bellshake {
  0% {
    transform: rotate(0);
  }
  10% {
    transform: rotate(5deg);
  }
  25% {
    transform: rotate(-5deg);
  }
  40% {
    transform: rotate(4deg);
  }
  55% {
    transform: rotate(-4deg);
  }
  70% {
    transform: rotate(2deg);
  }
  80% {
    transform: rotate(-2deg);
  }
  87% {
    transform: rotate(1deg);
  }
  95% {
    transform: rotate(0);
  }
  100% {
    transform: rotate(0);
  }
}

.announcement-bell-icon.new-announcements {
  animation: bellshake 1s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  animation-iteration-count: infinite;
}

// Dropdown arrow transition
.has-dropdown .navbar-link::after {
  transition: transform 0.1s;
  transition-timing-function: ease-out;
}

.has-dropdown:hover .navbar-link::after {
  transform: translateY(3px) rotate(135deg);
}
// ---------------------

.navbar-brand {
  .beta-tag {
    margin-left: 5px;
    margin-bottom: -2px;
    transition: background-color 0.2s;
    background-color: #70cad1;
  }
  &:hover {
    .beta-tag {
      background-color: #73dee6 !important;
    }
  }
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
      margin-right: 1px;
      margin-left: 1px;
    }
  }

  .announcement-icon {
    padding: 0.5rem 0.2rem;
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
