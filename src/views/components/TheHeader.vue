<!--Header module-->
<template>
  <header
    id="header"
    ref="header"
  >
    <b-navbar
      type="is-dark"
      :fixed-top="true"
      :close-on-click="true"
    >
      <template slot="brand">
        <b-navbar-item
          tag="router-link"
          class="late-logo"
          :to="{path: '/'}"
        >
          LATE
          <span
            v-if="inDevMode"
            class="tag beta-tag"
            :class="[inDevMode ? 'is-warning' : 'is-primary']"
            title="LATE is still in active development!"
          >DEV</span>
        </b-navbar-item>

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
          <label
            v-if="loggedIn"
            class="toggle is-hidden-desktop"
          >
            <a
              class="navbar-item toggle-wrapper"
              title="Toggle night/day theme"
            >

              <input
                type="checkbox"
                :checked="(mode === 'dark' ? 'checked' : false)"
                @change="toggleTheme"
              >
              <i class="fas fa-sun unchecked" />
              <i class="fas fa-moon checked" />

            </a>
          </label>
        </template>
      </template>

      <template slot="start">
        <template v-if="loggedIn">
          <b-navbar-item
            tag="router-link"
            class="home-link"
            :to="{name: 'dashboard-calendar'}"
            title="View your dashboard"
            exact
          >
            <span class="icon">
              <i class="fas fa-home" />
            </span>
            Dashboard
          </b-navbar-item>

          <b-navbar-item
            v-if="onBreak"
            tag="router-link"
            class="about-link"
            :to="{name: 'about'}"
            title="Learn more about LATE and its creators"
          >
            <span class="icon">
              <i class="far fa-question-circle" />
            </span>
            About
          </b-navbar-item>

          <b-navbar-item
            tag="router-link"
            :to="{name: 'coursework-upcoming'}"
            class="is-hidden-desktop"
          >
            <span class="icon">
              <i class="fas fa-graduation-cap" />
            </span>
            Coursework
          </b-navbar-item>

          <b-navbar-dropdown
            v-if="!onBreak"
            class="is-hidden-touch"
            title="Manage your assignments and exams!"
          >
            <template slot="label">
              <span class="icon">
                <i class="fas fa-graduation-cap" />
              </span>
              Coursework

              <span
                v-if="assessmentCount > 0"
                class="tag is-warning assignment-count"
              >{{ assessmentCount }}</span>
            </template>
            <b-navbar-item
              tag="router-link"
              :to="{name: 'coursework-upcoming'}"
              title="View upcoming assessments"
            >
              <b>Upcoming</b>
            </b-navbar-item>
            <b-navbar-item
              tag="router-link"
              :to="{name: 'coursework-past'}"
              title="Browse all past assessments"
            >
              Previous
            </b-navbar-item>
            <b-navbar-item
              tag="router-link"
              :to="{name: 'coursework-calendar'}"
              title="View a calendar of all your assessment due dates"
            >
              Calendar
            </b-navbar-item>
            <hr class="navbar-divider">
            <a
              href="#"
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
          </b-navbar-dropdown>
        </template>
        <template v-else>
          <b-navbar-item
            tag="router-link"
            :to="{name: 'about'}"
            title="Learn more about LATE and its creators"
          >
            <span class="icon">
              <i class="far fa-question-circle" />
            </span>
            About
          </b-navbar-item>
        </template>

        <b-navbar-item
          class="is-hidden-desktop"
          tag="router-link"
          :to="{name: 'tools'}"
        >
          <span class="icon"><i class="fas fa-toolbox" /></span>
          Tools
        </b-navbar-item>

        <b-navbar-dropdown
          class="is-hidden-touch"
          title="Student tools to calculate grades, help you work/study, and more!"
        >
          <template slot="label">
            <span class="icon">
              <i class="fas fa-toolbox" />
            </span>
            Tools
          </template>
          <b-navbar-item
            tag="router-link"
            :to="{name: 'quick-links'}"
            title="Student-curated RPI links"
          >
            RPI Quicklinks
          </b-navbar-item>
          <b-navbar-item
            tag="router-link"
            :to="{name: 'study-tools'}"
            title="Study timer and scratchpad"
          >
            Study Timer
          </b-navbar-item>
          <b-navbar-item
            tag="router-link"
            :to="{name: 'gpa-calculator'}"
            title="Calculate overall GPA and course grades"
          >
            Grade Calculators
          </b-navbar-item>
          <b-navbar-item
            tag="router-link"
            :to="{name: 'checklist'}"
            title="Create a checklist for dorm items for movein"
          >
            Dorm Checklist
          </b-navbar-item>
          <b-navbar-item
            tag="router-link"
            :to="{name: 'dorm-photos'}"
            title="Create a checklist for dorm items for movein"
          >
            RPI Dorm Photos
          </b-navbar-item>
        </b-navbar-dropdown>
      </template>

      <template slot="end">
        <a
          v-if="loggedIn"
          class="navbar-item"
          :title="`There are ${onlineUsers.length} users online.`"
        >
          <b-tag type="is-primary">{{ onlineUsers.length }} online</b-tag>
        </a>
        <a
          v-if="loggedIn"
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
        <b-navbar-dropdown
          v-if="loggedIn"
        >
          <template slot="label">
            <span class="icon">
              <i
                class="fas"
                :title="user.admin ? 'You are an administrator!' : ''"
                :class="[user.admin ? 'fa-star' : 'fa-user-circle']"
                :style="user.admin ? 'color:#e5c100' : 'color:#ffffff'"
              />
            </span>
            {{ user.displayName }}
          </template>
          <b-navbar-item
            v-if="user.admin"
            tag="router-link"
            :to="{name: 'admin-student-list', params: {page: 1}}"
            title="View the administrator page"
          >
            <span class="icon">
              <i class="fas fa-user-lock" />
            </span>
            Administration
          </b-navbar-item>

          <b-navbar-item
            tag="router-link"
            to="/account"
            title="Edit your account"
          >
            <span class="icon">
              <i class="fas fa-pencil-alt" />
            </span>
            Edit Account
          </b-navbar-item>

          <b-navbar-item
            tag="a"
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
          </b-navbar-item>

          <hr class="navbar-divider">

          <b-navbar-item
            v-if="!onBreak"
            tag="router-link"
            :to="{name: 'coursework-stats'}"
            title="View stats on your coursework"
          >
            <span class="icon">
              <i class="fas fa-chart-pie" />
            </span>
            Your Statistics
          </b-navbar-item>
          <b-navbar-item
            tag="router-link"
            :to="{name: 'archive-home'}"
            title="View your data from past semesters"
          >
            <span class="icon">
              <i class="fas fa-archive" />
            </span>
            Archive
          </b-navbar-item>

          <a
            class="navbar-item help-icon tours-icon"
            title="Show tours"
            @click="$store.commit('TOGGLE_TOURS_MODAL')"
          >
            <span class="icon">
              <i class="far fa-question-circle" />
            </span>
            Site Tour
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
        </b-navbar-dropdown>
        <b-navbar-item
          v-else
          tag="div"
          class="buttons"
        >
          <a
            class="button is-primary"
            href="/auth/login"
            title="Login with RPI CAS!"
          >
            Log In
          </a>
        </b-navbar-item>
        <label
          v-if="loggedIn"
          class="toggle is-hidden-touch"
        >
          <a
            class="navbar-item toggle-wrapper"
            title="Toggle night/day theme"
          >

            <input
              type="checkbox"
              :checked="(mode === 'dark' ? 'checked' : false)"
              @change="toggleTheme"
            >
            <i class="fas fa-sun unchecked" />
            <i class="fas fa-moon checked" />

          </a>
        </label>
      </template>
    </b-navbar>
  </header>
</template>

<script>
export default {
  name: 'TheHeader',
  props: {
    mode: {
      type: String,
      default: 'light'
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
    assessmentCount () {
      return this.$store.getters.limitedUpcomingAssessments.length
    },
    inDevMode () {
      return process.env.NODE_ENV !== 'production'
    }
  },
  methods: {
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
    },
    toggleTheme () {
      this.$parent.toggle()
    }
  }
}
</script>

<style lang="scss">

.toggle-wrapper {
  padding: 0px;
  margin-right: 10px;
  height: 100%;
  transition: 0.2s;
  i { color: white!important; }
}
.toggle-wrapper:hover {
  background-color: rgba(0,0,0,0)!important;
  .checked {color: aqua!important;}
  .unchecked {color: yellow!important;}
  transition: 0.2s;
}
.toggle input[type="checkbox"],
.toggle .checked {
    display: none;
}
.toggle input[type="checkbox"]:checked ~ .checked
{
    display: inline-block;
}

.toggle input[type="checkbox"]:checked ~ .unchecked
{
    display: none;
}

.toggle i {
  cursor: pointer;
  font-size: 1.2em;
  vertical-align: middle;
}

// .has-dropdown:hover .navbar-dropdown {
//     animation: navAnimOpen 0.15s ease-in-out;
// }

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

#header {
  .announcement-icon:hover {
    background-color: initial;
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

  .has-dropdown.is-active .navbar-link::after {
    transform: translateY(3px) rotate(135deg);
  }
  // ---------------------

  .late-logo {
    font-weight: 800;
    font-size: 1.5em;

    .beta-tag {
      margin-left: 5px;
    }
  }

  .navbar-item span.icon {
    margin-right: 0px !important;
  }

  span.tag.assignment-count,
  span.tag.exam-count,
  span.tag.announcement-count {
    padding-left: 5px;
    padding-right: 5px;
    margin-left: 7px;
  }
}

// .navbar-brand {
//   .beta-tag {
//     margin-left: 5px;
//     margin-bottom: -2px;
//     transition: background-color 0.2s;
//   }
//   &:hover {
//     .beta-tag.is-primary {
//       background-color: #73dee6 !important;
//     }
//   }
// }
// .no-margin-left {
//   margin-left: 0;
// }

// #logo {
//   font-size: 1.6rem;
//   font-weight: 600;
// }

// #top-navbar {
//   //Pushes the left and right navbar menus slightly off the edges of the screen.
//   padding: 0;

//   .navbar-item {
//     span.icon {
//       margin-right: 1px;
//       margin-left: 1px;
//     }
//   }

// }

// //Mobile dropdown mediaquery
// @media only screen and (max-width: 1024px) {
//   //Force navbar to take up whole screen
//   .navbar-menu {
//     min-height: 95vh;
//     background-color: white;
//   }
//   //Remove onlineCount and dropdown arrows
//   .onlineCount,.navbar-link:not(.is-arrowless)::after { display: none; }
//   //Increase size of buttons without dropdowns
//   .home-link,.toolsDropdown {
//     padding-top: 15px;
//     padding-bottom: 15px;
//   }
//   //Remove tools dropdown (mobile users can use index page)
//   .toolsDropdown .navbar-dropdown {
//     display: none;
//   }
//   //Shift all child items to right and add border
//   .navbar-item {
//     &.has-dropdown {
//       .navbar-dropdown {
//         border-left: 1px solid black;
//         padding: 0px;
//         margin-left: 25px;
//       }
//       &.is-active {
//         .navbar-dropdown {
//           display: block;
//         }
//        }
//      }
//   }
// }
</style>
