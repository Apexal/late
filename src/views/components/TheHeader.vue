<!--Header module-->
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
          to="/overview"
          active-class
          exact-active-class
        >
          LATE
          <span
            v-if="inDevMode"
            class="tag beta-tag"
            :class="[inDevMode ? 'is-warning' : 'is-primary']"
            title="LATE is still in active development!"
          >DEV</span>
        </router-link>
        <template v-if="loggedIn">
          <a
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
            class="navbar-item help-icon is-hidden-desktop"
            title="Show tours"
            @click="$store.commit('TOGGLE_TOURS_MODAL')"
          >
            <span class="icon">
              <i class="far fa-question-circle" />
            </span>
          </a>
        </template>

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
              class="navbar-item home-link"
              :to="{name: 'dashboard-calendar'}"
              title="View your dashboard"
              exact
            >
              <span class="icon">
                <i class="fas fa-home" />
              </span>
              <span>Dashboard</span>
            </router-link>

            <router-link
              v-if="onBreak"
              class="navbar-item about-link"
              :to="{name: 'about'}"
              title="Learn more about LATE and its creators"
            >
              <span class="icon">
                <i class="far fa-question-circle" />
              </span>
              <span>About</span>
            </router-link>

            <div
              v-if="!onBreak"
              class="navbar-item has-dropdown is-hoverable"
            >
              <router-link
                :to="{name: 'coursework-upcoming'}"
                class="navbar-link coursework-link"
                title="Manage your assignments and exams!"
              >
                <span class="icon">
                  <i class="fas fa-graduation-cap" />
                </span>
                <span>Coursework</span>
              </router-link>

              <div class="navbar-dropdown">
                <router-link
                  class="navbar-item"
                  :to="{name: 'coursework-upcoming'}"
                  title="View upcoming assessments"
                >
                  <b>Upcoming</b>
                </router-link>
                <router-link
                  class="navbar-item"
                  :to="{name: 'coursework-past'}"
                  title="Browse all past assessments"
                >
                  Previous
                </router-link>
                <router-link
                  class="navbar-item"
                  :to="{name: 'coursework-calendar'}"
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
                  <span>Add Assignment</span>
                </a>
                <a
                  class="navbar-item"
                  title="Add a new exam"
                  @click="$store.commit('TOGGLE_ADD_EXAM_MODAL')"
                >
                  <span class="icon">
                    <i class="fas fa-exclamation-triangle" />
                  </span>
                  <span>Add Exam</span>
                </a>
              </div>
            </div>
            <!-- <div
              v-if="!onBreak"
              class="navbar-item has-dropdown is-hoverable"
            >
              <router-link
                :to="{name: 'schedule-planner'}"
                class="navbar-link coursework-link"
                title="Manage your assignments and exams!"
              >
                <span class="icon">
                  <i class="fas fa-users" />
                </span>
                <span>Collaboration</span>
              </router-link>

              <div class="navbar-dropdown">
                <a
                  class="navbar-item has-text-grey"
                  href="#"
                  title="(coming soon) See what your peers have though about courses!"
                >
                  Course Opinions
                </a>
                <a
                  class="navbar-item has-text-grey"
                  href="#"
                  title="(coming soon) View and contribute past assignments, exams, etc. from courses!"
                >
                  Backwork Database
                </a>
                <router-link
                  class="navbar-item"
                  :to="{name: 'study-groups-home'}"
                  title="Find times to meet with your peers"
                >
                  Study Groups
                </router-link>
                <a
                  class="navbar-item has-text-grey"
                  href="#"
                  title="(coming soon) Find peers willing to help you out!"
                >
                  Peer Help
                </a>
              </div>
            </div> -->
            <div
              v-if="!onBreak"
              class="navbar-item has-dropdown is-hoverable"
            >
              <router-link
                :to="{name: 'schedule-planner'}"
                class="navbar-link coursework-link"
                title="Manage your assignments and exams!"
              >
                <span class="icon">
                  <i class="far fa-calendar-alt" />
                </span>
                <span>Scheduling</span>
              </router-link>

              <div class="navbar-dropdown">
                <router-link
                  class="navbar-item"
                  :to="{name: 'schedule-planner'}"
                  title="Plan course sections"
                >
                  Plan Course Schedule
                </router-link>
              </div>
            </div>
          </template>
          <template v-else>
            <router-link
              class="navbar-item"
              :to="{name: 'about'}"
              title="Learn more about LATE and its creators"
            >
              <span class="icon">
                <i class="far fa-question-circle" />
              </span>
              <span>About</span>
            </router-link>
          </template>
          <!-- <div
            class="navbar-item has-dropdown is-hoverable toolsDropdown"
          >
            <router-link
              :to="{name: 'tools'}"
              class="navbar-link coursework-link"
              title="Student tools to calculate grades, help you work/study, and more!"
            >
              <span class="icon">
                <i class="fas fa-toolbox" />
              </span>
              <span>Tools</span>
            </router-link>

            <div class="navbar-dropdown">
              <router-link
                class="navbar-item"
                :to="{name: 'quick-links'}"
                title="Student-curated RPI links"
              >
                RPI Quicklinks
              </router-link>
              <router-link
                class="navbar-item"
                :to="{name: 'study-tools'}"
                title="Study timer and scratchpad"
              >
                Study Timer
              </router-link>
              <router-link
                class="navbar-item"
                :to="{name: 'gpa-calculator'}"
                title="Calculate overall GPA and course grades"
              >
                Grade Calculators
              </router-link>
              <router-link
                class="navbar-item"
                :to="{name: 'checklist'}"
                title="Create a checklist for dorm items for movein"
              >
                Dorm Checklist
              </router-link>
              <router-link
                class="navbar-item"
                :to="{name: 'dorm-photos'}"
                title="Create a checklist for dorm items for movein"
              >
                RPI Dorm Photos
              </router-link>
              <router-link
                class="navbar-item"
                :to="{name: 'study-groups-home'}"
                title="Create and join study groups with your peers"
              >
                Study Groups
              </router-link>
            </div>
          </div> -->
        </div>

        <div class="navbar-end">
          <template v-if="loggedIn">
            <a
              class="navbar-item onlineCount"
              :title="`There ${onlineUsers.length > 1 ? 'are ' + onlineUsers.length + ' users' : 'is 1 user'} online.`"
              @click="rickRollModalOpen=true"
            >
              <b-tag type="is-primary">{{ onlineUsers.length }} online</b-tag>
            </a>
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
            <div class="navbar-item has-dropdown is-hoverable user-dropdown">
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
                <span>{{ user.displayName }}</span>
              </a>

              <div class="navbar-dropdown is-right">
                <a
                  v-if="inDevMode"
                  href="#"
                  class="navbar-item"
                  @click="changeDevUser"
                >Change Dev User</a>

                <router-link
                  v-if="user.admin"
                  class="navbar-item"
                  :to="{name: 'admin-student-list', params: {page: 1}}"
                  title="View the administrator page"
                >
                  <span class="icon">
                    <i class="fas fa-user-lock" />
                  </span>
                  <span>Administration</span>
                </router-link>

                <router-link
                  class="navbar-item"
                  to="/account"
                  title="Edit your account"
                >
                  <span class="icon">
                    <i class="fas fa-pencil-alt" />
                  </span>
                  <span>Edit Account</span>
                </router-link>

                <a
                  class="navbar-item"
                  target="_blank"
                  title="Report a bug or request a feature on GitHub"
                  href="https://forms.gle/SBbjRaxZ7KmbgPeC9"
                >
                  <span class="icon bug-report">
                    <i
                      class="fas fa-bug"
                      style="margin-right: 5px"
                    />
                  </span>
                  <span>Give feedback</span>
                </a>

                <hr class="navbar-divider">

                <router-link
                  v-if="!onBreak"
                  class="navbar-item"
                  :to="{name: 'coursework-stats'}"
                  title="View stats on your coursework"
                >
                  <span class="icon">
                    <i class="fas fa-chart-pie" />
                  </span>
                  <span>Your Statistics</span>
                </router-link>
                <router-link
                  class="navbar-item"
                  :to="{name: 'archive-home'}"
                  title="View your data from past semesters"
                >
                  <span class="icon">
                    <i class="fas fa-archive" />
                  </span>
                  <span>Archive</span>
                </router-link>

                <a
                  class="navbar-item help-icontours-icon"
                  title="Show tours"
                  @click="$store.commit('TOGGLE_TOURS_MODAL')"
                >
                  <span class="icon">
                    <i class="far fa-question-circle" />
                  </span>
                  <span>Site Tour</span>
                </a>
                <hr
                  class="navbar-divider"
                >

                <a
                  class="navbar-item"
                  href="/auth/logout"
                  title="Sign out of LATE"
                >
                  <span class="icon">
                    <i class="fas fa-sign-out-alt" />
                  </span>
                  <span>Log out</span>
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
    <b-modal
      class="rick-roll-modal"
      style="height: 100%;"
      :active.sync="rickRollModalOpen"
    >
      <iframe
        width="960"
        height="540"
        style="height: 100%;"
        src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
        frameborder="0"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
      />
    </b-modal>
  </header>
</template>

<script>
export default {
  name: 'TheHeader',
  data () {
    return {
      rickRollModalOpen: false
    }
  },
  computed: {
    onlineUsers () {
      return this.$store.state.socketio.onlineUsers
    },
    seenAnnouncementIDs () {
      return this.$store.state.announcements.seenIDs
    },
    announcementsCount () {
      return this.$store.getters.allAnnouncements.filter(
        a => !this.seenAnnouncementIDs.includes(a._id)
      ).length
    },
    isUserSetup () {
      return this.$store.getters.isUserSetup
    },
    navbarExpanded () {
      return this.$store.state.navbarExpanded
    },
    assessmentCount () {
      return this.$store.getters.limitedUpcomingAssessments.length
    },
    inDevMode () {
      return process.env.NODE_ENV !== 'production'
    }
  },
  methods: {
    changeDevUser () {
      const rcsId = prompt('Change dev user to? (RCS ID)')
      if (rcsId) {
        localStorage.setItem('devUserRcsId', rcsId)
        location.reload()
      }
    },
    openAnnouncementsModal () {
      // Mark all announcements as seen
      localStorage.setItem(
        'seenAnnouncementIDs',
        JSON.stringify(this.$store.getters.allAnnouncements.map(ann => ann._id))
      )

      this.$store.commit(
        'SET_SEEN_ANNOUNCEMENT_IDS',
        this.$store.getters.allAnnouncements.map(ann => ann._id)
      )

      this.$store.commit('SET_ANNOUNCEMENTS_MODEL_OPEN', true)
    }
  }
}
</script>

<style lang="scss">
.rick-roll-modal {
  .modal-content {
    height: 100%;
  }
}

.has-dropdown:hover .navbar-dropdown {
    animation: navAnimOpen 0.15s ease-in-out;
}

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

@keyframes navAnimOpen {
  0% {display: none;opacity: 0;margin-top: -5px}
  1% {display: block;opacity: 0;}
  100% {opacity: 1;max-height: 396px;margin-top: 0px;}
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
  }
  &:hover {
    .beta-tag.is-primary {
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

//Mobile dropdown mediaquery
@media only screen and (max-width: 1024px) {
  //Force navbar to take up whole screen
  .navbar-menu {
    min-height: 95vh;
    background-color: white;
  }
  //Remove onlineCount and dropdown arrows
  .onlineCount,.navbar-link:not(.is-arrowless)::after { display: none; }
  //Increase size of buttons without dropdowns
  .home-link,.toolsDropdown {
    padding-top: 15px;
    padding-bottom: 15px;
  }
  //Remove tools dropdown (mobile users can use index page)
  .toolsDropdown .navbar-dropdown {
    display: none;
  }
  //Shift all child items to right and add border
  .navbar-item {
    &.has-dropdown {
      .navbar-dropdown {
        border-left: 1px solid black;
        padding: 0px;
        margin-left: 25px;
      }
      &.is-active {
        .navbar-dropdown {
          display: block;
        }
       }
     }
  }
}
</style>
