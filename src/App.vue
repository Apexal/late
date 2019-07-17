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
            <ExamsModalAddRedux
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
              @close-modal="
                $store.commit('SET_ANNOUNCEMENTS_MODEL_OPEN', false)
              "
            />

            <SISMan />
            <AssessmentsAddFAB v-if="!onBreak" />
            <StudyToolsTimerOverlay
              v-if="$route.path != '/studytools'"
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
import TheHeader from '@/views/components/TheHeader';
import TheFooter from '@/views/components/TheFooter';
import TheSidebar from '@/views/sidebar/components/TheSidebar';
import AssignmentsModalAdd from '@/views/assignments/components/AssignmentsModalAddRedux';
import ExamsModalAddRedux from '@/views/exams/components/ExamsModalAddRedux';
import CourseModal from '@/views/courses/components/CourseModal';
import PinnedAnnouncements from '@/views/announcements/components/PinnedAnnouncements';
import AnnouncementsModal from '@/views/announcements/components/AnnouncementsModal';
import ToursModal from '@/views/components/ToursModal';

import StudyToolsTimerOverlay from '@/views/studytools/StudyToolsTimerOverlay';
import AssessmentsAddFAB from '@/views/assessments/components/AssessmentsAddFAB';

import SISMan from '@/views/sisman/components/SISMan';

export default {
  name: 'LATE',
  components: {
    CourseModal,
    ToursModal,
    TheHeader,
    TheSidebar,
    TheFooter,
    AssignmentsModalAdd,
    ExamsModalAddRedux,
    AnnouncementsModal,
    PinnedAnnouncements,
    AssessmentsAddFAB,
    StudyToolsTimerOverlay,
    SISMan

  },
  data () {
    return {
      resizeTimeout: null,
      tourCallbacks: {
        onStop: this.onTourStop
      }
    };
  },
  computed: {
    loaded () {
      return this.$store.state.loaded;
    },
    tour () {
      return this.$store.getters.currentTour;
    },
    toursModalOpen () {
      return this.$store.state.tours.modalOpen;
    },
    sidebarExpanded () {
      return this.$store.state.sidebarExpanded;
    },
    homepage () {
      return this.$route.meta.isHome && !this.loggedIn;
    },
    appClass () {
      return {
        'columns is-marginless': this.loggedIn && this.sidebarExpanded,
        container: !this.loggedIn || !this.sidebarExpanded,
        homepage: this.homepage
      };
    },
    studyToolsTimerOpen () {
      return (
        this.$store.state.studytoolstimer.open &&
        this.$route.name !== 'study-tools-timer'
      );
    },
    courseModalData () {
      return this.$store.state.courseModal.current;
    },
    courseModalOpen () {
      return this.$store.state.courseModal.open;
    },
    announcementsModalOpen () {
      return this.$store.state.announcements.modalOpen;
    },
    announcements () {
      return this.$store.getters.allAnnouncements;
    },
    addAssignmentModalExpanded () {
      return this.$store.state.addAssignmentModal.expanded;
    },
    addExamModalExpanded () {
      return this.$store.state.addExamModal.expanded;
    },
    isUserSetup () {
      return this.$store.getters.isUserSetup;
    }
  },
  watch: {
    tour () {
      this.$nextTick(() => {
        setTimeout(() => {
          if (this.tour) this.$tours.custom.start();
        }, 1000);
      });
    },
    user () {
      this.$socket.emit('authentication', this.user._id);
    }
  },
  async mounted () {
    if (this.$route.query.accountLocked) {
      return this.$toast.open({
        message: 'Your account has been locked by administrators.',
        type: 'is-warning',
        duration: 70000
      });
    }
  },
  methods: {
    onTourStop () {
      this.$store.dispatch('MARK_TOUR_SEEN', this.tour);
      this.$store.commit('SET_TOUR_INDEX', -1);
    }
  }
};
</script>

<style lang="scss">
@import '@/assets/late_theme.scss';
/*-------------------------------------------*/
/*               Global Styles
/* These styles will apply to the whole app. */
/*-------------------------------------------*/
* {
  word-wrap: break-word;
  outline: 0;
}

.is-fullwidth {
  width: 100%;
}

//Removes annoying outline around elements when clicked.
// *:focus {
//   outline: none;
//   box-shadow: none !important;
//   -webkit-tap-highlight-color: rgba(0, 0, 0, 0) !important;
// }

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
}

#content {
  flex: 1 0 auto;
}
#footer {
  flex-shrink: 0;
}
section.section {
  padding: 1.5rem;
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
  -webkit-transform: translate(30px, 0);
  transform: translate(30px, 0);
  margin-right: -30px;
}
.slide-left-leave-active,
.slide-right-enter {
  opacity: 0;
  -webkit-transform: translate(-30px, 0);
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

.modal-content {
  max-width: 800px;
}

.exam-event {
  font-weight: bold;
}

.v-tour .v-step {
  z-index: 2;
}


// ------ FULLCALENDAR -------

@media only screen and (max-width: 768px) {
  .fc-toolbar.fc-header-toolbar {
    flex-direction: column;
  }
}

.work-block-event {
  border-width: 3px !important;

  .margin-left {
    margin-left: 5px;
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
}

.fc-content {
  .remove-work-block {
    display: none;
    position: absolute;
    right: 0;
    top: 0;
  }

  .remove-work-block {
    display: none;
    position: absolute;
    right: 0;
    top: 0;
    &:hover {
      background-color: red;
    }
  }

  &:hover {
    .remove-work-block {
      display: block;
    }
  }
}

</style>
