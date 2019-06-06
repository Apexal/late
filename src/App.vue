<template>
  <div id="app">
    <vue-progress-bar />
    <TheHeader ref="header" />

    <main id="content">
      <b-loading
        :is-full-page="true"
        :active="loading"
        :can-cancel="false"
      />
      <transition name="slide-fade">
        <span
          v-if="loggedIn && !expanded"
          class="icon button is-dark toggle-sidebar"
          title="Toggle sidebar."
          @click="$store.commit('TOGGLE_SIDEBAR')"
        >
          <i
            :class="
              'fas ' +
                (expanded
                  ? 'fas fa-chevron-up fa-rotate-270'
                  : 'fas fa-chevron-up fa-rotate-90')
            "
          />
        </span>
      </transition>
      <div :class="appClass">
        <transition name="slide-fade">
          <div
            v-if="loggedIn && expanded"
            id="sidebar-column"
            class="column is-3 sidebar-holder"
          >
            <TheSidebar
              ref="sidebar"
              @sidebar-loaded="onResize"
            />
          </div>
        </transition>

        <div
          :class="[
            loggedIn && expanded ? 'column' : '',
            { 'no-sidebar': !expanded }
          ]"
        >
          <template v-if="loggedIn">
            <PinnedAnnouncements v-if="loggedIn" />
            <StudyToolsTimer
              v-if="$route.path != '/studytools'"
              :detached="true"
              :open="studyToolsTimerOpen"
            />
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
            <AnnouncementsModal
              :open="announcementsModalOpen"
              :announcements="announcements"
              @close-modal="
                $store.commit('SET_ANNOUNCEMENTS_MODEL_OPEN', false)
              "
            />
            <SISMan />
            <AssessmentsAddFAB v-if="!onBreak" />
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
import TheSidebar from '@/views/components/sidebar/TheSidebar';
import AssignmentsModalAdd from '@/views/components/assignments/AssignmentsModalAddRedux';
import ExamsModalAddRedux from '@/views/components/exams/ExamsModalAddRedux';
import CourseModal from '@/views/components/courses/CourseModal';
import PinnedAnnouncements from '@/views/components/announcements/PinnedAnnouncements';
import AnnouncementsModal from '@/views/components/announcements/AnnouncementsModal';

import StudyToolsTimer from '@/views/studytools/StudyToolsTimerOverlay';
import AssessmentsAddFAB from '@/views/components/assessments/AssessmentsAddFAB';

import SISMan from '@/views/components/sisman/SISMan';

export default {
  name: 'LATE',
  components: {
    CourseModal,
    TheHeader,
    TheSidebar,
    TheFooter,
    AssignmentsModalAdd,
    ExamsModalAddRedux,
    AnnouncementsModal,
    PinnedAnnouncements,
    AssessmentsAddFAB,
    StudyToolsTimer,
    SISMan
  },
  data () {
    return {
      resizeTimeout: null,
      loading: true
    };
  },
  computed: {
    homepage () {
      return this.$route.name === 'home' && !this.loggedIn;
    },
    appClass () {
      return {
        'columns is-marginless': this.loggedIn && this.expanded,
        container: this.loggedIn && !this.expanded,
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
    expanded () {
      return this.$store.state.sidebarExpanded;
    },
    isUserSetup () {
      return this.$store.getters.isUserSetup;
    }
  },
  async mounted () {
    if (typeof window.orientation === 'undefined') {
      window.addEventListener('resize', this.resizeThrottler, false);
    }

    if (this.$route.query.accountLocked) {
      this.loading = false;
      return this.$toast.open({
        message: 'Your account has been locked by administrators.',
        type: 'is-warning',
        duration: 70000
      });
    }

    if (
      process.env.NODE_ENV === 'development' &&
      !this.$store.state.auth.isAuthenticated
    ) {
      const rcsID = prompt('Log in as what user? (rcs_id)');
      await this.$http.get('/students/loginas?rcs_id=' + rcsID);
    }

    // Seems like we need the following line no matter what :/
    await this.$store.dispatch('GET_USER');
    if (this.$store.state.auth.isAuthenticated) {
      await this.$store.dispatch('GET_TERMS');
      const calls = [];
      if (!this.$store.getters.onBreak) {
        calls.concat([
          this.$store.dispatch('GET_COURSES'),
          this.$store.dispatch('GET_UNAVAILABILITIES'),
          this.$store.dispatch('AUTO_GET_UPCOMING_WORK')
        ]);
      }
      calls.concat([
        this.$store.dispatch('GET_TODOS'),
        this.$store.dispatch('GET_ANNOUNCEMENTS'),
        this.$store.dispatch('AUTO_UPDATE_NOW')
      ]);
      await Promise.all(calls);
    }

    this.loading = false;
  },
  methods: {
    resizeThrottler () {
      // ignore resize events as long as an actualResizeHandler execution is in the queue
      if (!this.resizeTimeout) {
        this.resizeTimeout = setTimeout(() => {
          this.resizeTimeout = null;
          this.onResize();
          // The actualResizeHandler will execute at a rate of 15fps
        }, 66);
      }
    },
    onResize () {
      // if (document.getElementById('sidebar').style.position === 'fixed') {
      if (document.getElementById('sidebar-column')) {
        document.getElementById('sidebar').style.width =
          document.getElementById('sidebar-column').offsetWidth - 15 + 'px';
      }
      // }
    }
  }
};
</script>

<style lang="scss">
@import "@/assets/late_theme.scss";

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

// Replace Fullcalendar ugly button style with Bulma's nice style
.fc-button {
  color: initial;
  background: none;
  text-shadow: none;
  //@extend .button;
}

.toggle-sidebar {
  cursor: pointer;
  top: 70px;
  z-index: 4;
  position: fixed;
  @media only screen and (max-width: 768px) {
    position: absolute;
    top: 55px;
  }

  //Styling the toggle button to fit the theme
  margin: 1em;
  margin-top: 0.5em;
  width: 2.5em;
  height: 1.5em;
}

.toggle-sidebar i {
  transition: 0.1s;
  -webkit-transition: 0.1s;
  -moz-transition: 0.1s;
}

.toggle-sidebar:hover i {
  margin-right: -6px;
  transition: 0.1s;
  -webkit-transition: 0.1s;
  -moz-transition: 0.1s;
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
  transition: all 0.15s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateX(-80px);
  margin-right: -80px;
  opacity: 0;
}

.modal-content {
  max-width: 800px;
}

.exam-event {
  font-weight: bold;
}
</style>
