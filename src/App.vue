<template>
  <div id="app">
    <vue-progress-bar />
    <TheHeader ref="header" />

    <main id="content">
      <b-loading
        :is-full-page="true"
        :active="!loaded"
        :can-cancel="false"
      />

      <div :class="appClass">
        <span
          v-if="!sidebarExpanded"
          class="tag icon toggle-sidebar has-text-dark"
          title="Open sidebar"
          @click="$store.commit('TOGGLE_SIDEBAR')"
        >
          <i class="fas fa-angle-right" />
        </span>
        <div
          v-if="loggedIn && sidebarExpanded"
          id="sidebar-column"
          class="column is-3 sidebar-holder"
        >
          <TheSidebar ref="sidebar" />
        </div>
        <div :class="[loggedIn ? 'column' : '']">
          <template v-if="loggedIn">
            <PinnedAnnouncements v-if="loggedIn" />
            <AssignmentsModalAdd
              v-if="!onBreak"
              :open="addAssignmentModalExpanded"
              @toggle-modal="$store.commit('TOGGLE_ADD_ASSIGNMENT_MODAL')"
            />
            <ExamsModalAdd
              v-if="!onBreak"
              :open="addExamModalExpanded"
              @toggle-modal="$store.commit('TOGGLE_ADD_EXAM_MODAL')"
            />
            <CourseModal
              v-if="!onBreak"
              :open="courseModalOpen"
              :course="courseModalData"
            />
            <ToursModal
              :open="toursModalOpen"
              @close-modal="$store.commit('TOGGLE_TOURS_MODAL')"
            />
            <v-tour
              v-if="tour"
              name="custom"
              :steps="tour.steps"
              :callbacks="tourCallbacks"
            />
            <AnnouncementsModal
              :open="announcementsModalOpen"
              :announcements="announcements"
              @close-modal="$store.commit('SET_ANNOUNCEMENTS_MODEL_OPEN', false)"
            />
            <SISMan />
            <StudyToolsTimerOverlay
              v-if="$route.path !== '/studytools'"
              :open="studyToolsTimerOpen"
            />
          </template>
          <transition
            name="fade"
            mode="out-in"
          >
            <router-view />
          </transition>
        </div>
      </div>
    </main>

    <TheFooter id="footer" />
  </div>
</template>

<script>
import * as Sentry from '@sentry/browser'
import moment from 'moment'

import TheHeader from '@/views/components/TheHeader'
import TheFooter from '@/views/components/TheFooter'
import TheSidebar from '@/views/sidebar/components/TheSidebar'
import AssignmentsModalAdd from '@/views/assignments/components/AssignmentsModalAdd'
import ExamsModalAdd from '@/views/exams/components/ExamsModalAdd'
import CourseModal from '@/views/courses/components/CourseModal'
import PinnedAnnouncements from '@/views/announcements/components/PinnedAnnouncements'
import AnnouncementsModal from '@/views/announcements/components/AnnouncementsModal'
import ToursModal from '@/views/components/ToursModal'

import StudyToolsTimerOverlay from '@/views/studytools/StudyToolsTimerOverlay'

import SISMan from '@/views/sisman/components/SISMan'

import account from '@/mixins/account'

import sistext from '@/modules/sistext'
import Konami from 'konami'
// import reverse from '@/modules/konami'

export default {
  name: 'LATE',
  components: {
    CourseModal,
    ToursModal,
    TheHeader,
    TheSidebar,
    TheFooter,
    AssignmentsModalAdd,
    ExamsModalAdd,
    AnnouncementsModal,
    PinnedAnnouncements,
    StudyToolsTimerOverlay,
    SISMan
  },
  mixins: [account],
  data () {
    return {
      resizeTimeout: null,
      tourCallbacks: {
        onStop: this.onTourStop
      }
    }
  },
  computed: {
    loaded () {
      return this.$store.state.loaded
    },
    tour () {
      return this.$store.getters.currentTour
    },
    toursModalOpen () {
      return this.$store.state.tours.modalOpen
    },
    sidebarExpanded () {
      return this.$store.state.sidebarExpanded
    },
    homepage () {
      return this.$route.meta.isHome && !this.loggedIn
    },
    appClass () {
      return {
        'columns is-marginless': this.loggedIn && this.sidebarExpanded,
        container: !this.loggedIn || !this.sidebarExpanded,
        homepage: this.homepage
      }
    },
    studyToolsTimerOpen () {
      return (
        this.$store.state.studytoolstimer.open &&
        this.$route.name !== 'study-tools-timer'
      )
    },
    courseModalData () {
      return this.$store.state.courseModal.current
    },
    courseModalOpen () {
      return this.$store.state.courseModal.open
    },
    announcementsModalOpen () {
      return this.$store.state.announcements.modalOpen
    },
    announcements () {
      return this.$store.getters.allAnnouncements
    },
    addAssignmentModalExpanded () {
      return this.$store.state.addAssignmentModal.expanded
    },
    addExamModalExpanded () {
      return this.$store.state.addExamModal.expanded
    },
    isUserSetup () {
      return this.$store.getters.isUserSetup
    },
    sistext () {
      return sistext
    }
  },
  watch: {
    tour () {
      this.$nextTick(() => {
        setTimeout(() => {
          if (this.tour) this.$tours.custom.start()
        }, 1000)
      })
    },
    user () {
      this.$socket.client.emit('authentication', this.user._id)
    }
  },
  async mounted () {
    if (this.$route.query.accountLocked) {
      return this.showError('Your account has been locked by administrators.')
    } else if (this.$route.query.invited) {
      this.$buefy.toast.open({
        message: 'Your invitation has been accepted!',
        type: 'is-warning',
        duration: 5000
      })
    }

    if (this.loggedIn) {
      this.$ga.set({ userId: this.user.id })
      // Check if time to reupdate from SIS
      if (!this.user.lastSISUpdate || moment().diff(this.user.lastSISUpdate, 'days') > 40) {
        this.$router.push({ name: 'account', query: { importFromSIS: true } })
      }

      Sentry.configureScope(function (scope) {
        scope.setUser({ username: this.user.rcs_id })
      })
    }

    const easterEgg = new Konami('http://www.shirleyannjackson.biz/')

    console.log(this.sistext)
    console.log('%cSIS MAN says never share your SIS password!', 'font-weight: bold; text-align: center; font-size: 30px')
  },
  methods: {
    onTourStop () {
      this.$store.dispatch('MARK_TOUR_SEEN', this.tour)
      this.$store.commit('SET_TOUR_INDEX', -1)
    }
  }
}
</script>

<style lang="scss">
@import '@/assets/late_theme.scss';
/*-------------------------------------------*/
/*               Global Styles
/* These styles will apply to the whole app. */
/*-------------------------------------------*/

.is-fullwidth {
  width: 100%;
}

html,
body {
  height: 100%;
}

/*-------------------------------------------*/
/*             All other styles
/*-------------------------------------------*/

// Sticky Footer

#app {
  display: flex;
  flex-direction: column;
  height: 100%;
  //Add background-color here for specifying dark mode
}

#content {
  flex: 1 0 auto;
}
#footer {
  flex-shrink: 0;
}

section.section {
  padding: 1.5rem;

  /*
    There are two kinds of page titles. One is a simple title (with an optional subtitle)
    and the other is a title inside page tabs.
  */
  .title:not(.main-title) {
    padding: 0px;
    padding-bottom: 5px;
  }

  .tabs .title {
    margin: 0;
  }

  > .title:not(.main-title) {
    border-bottom-color: #dbdbdb;
    border-bottom-style: solid;
    border-bottom-width: 1px;
  }

  > .subtitle {
    color: #777;
  }
}

@media only screen and (max-width: 1216px) {
  section.section {
    padding: 1rem;
  }
}

@media only screen and (max-width: 768px) {
  section.section {
    padding: 1rem 0.5rem;
  }
}

//Toggle sidebar
.toggle-sidebar {
  transition: 0.2s !important;
  transition-timing-function: ease-out;
  background-color: white;

  width: 40px;
  border: 1px solid rgb(207, 207, 207);
  cursor: pointer;
  z-index: 4;
  position: fixed;
  left: 5px;
  top: 60px;
  font-size: 30px;
  i {
    font-size: 15px;
  }
}
.toggle-sidebar:hover {
  transition: 0.2s !important;
  transition-timing-function: ease-out;
  background-color: whitesmoke;
  i {
    transform: translateX(2px);
  }
}

/* TRANSITIONS */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 200ms ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.child-view {
  transition: all 100ms cubic-bezier(0.55, 0, 0.1, 1);
}

//Slide

.slide-left-enter,
.slide-right-leave-active {
  opacity: 0;
  transform: translate(30px, 0);
  margin-right: -30px;
}
.slide-left-leave-active,
.slide-right-enter {
  opacity: 0;
  transform: translate(-30px, 0);
}

//Slide-fade
.slide-fade-enter-active {
  transition: all 0.2s ease;
}
.slide-fade-leave-active {
  //0.15s
  transition: all 0.15s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateX(-80px);
  //margin-right: -80px;
  opacity: 0;
}

.exam-event {
  font-weight: bold;
}

.v-tour .v-step {
  z-index: 2;
}

footer.footer {
  margin-top: 30px;
}

// ------ FULLCALENDAR -------

.fc-button-primary {
  background-color: var(--dark-color);
}

.fc-button-active {
  background-color: rgb(37, 48, 72) !important;
}

@media only screen and (max-width: 768px) {
  .fc-toolbar.fc-header-toolbar {
    flex-direction: column;
  }
}

.event-location {
  opacity: 0;
  transition: opacity 0.1s;
}

.fc-event {
  &:hover {
    .event-location {
      opacity: 1;
    }
  }

  .corner {
    opacity: 0.3;
    position: absolute;
    bottom: 5px;
    right: 5px;
    font-size: 2.5em;
  }

  /* Give some spacing in .fc-time */
  :not(.corner) {
    margin-right: 2px;
  }
}

.fc-content {
  .delete {
    display: none;
    position: absolute;
    right: 0;
    top: 0;
    &:hover {
      background-color: red;
    }
  }

  &:hover {
    .delete {
      display: block;
    }
  }
}

/* UTILS */
.is-clickable {
  cursor: pointer;
}
</style>
