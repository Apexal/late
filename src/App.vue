<template>
  <div id="app">
    <div id="content">
      <vue-progress-bar />
      <TheHeader ref="header" />
      <b-loading
        :is-full-page="true"
        :active="loading"
        :can-cancel="false"
      />
      <template v-if="loggedIn">
        <CourseModal
          :open="courseModalOpen"
          :course="courseModalData"
        />
        <AnnouncementsModal
          :open="announcementsModalOpen"
          :announcements="announcements"
          @close-modal="$store.commit('SET_ANNOUNCEMENTS_MODEL_OPEN', false)"
        />
        <SISMan />
        <AssessmentsAddFAB />
      </template>
      <template v-if="!loading">
        <StudyToolsTimer
          v-if="$route.path !='/studytools'"
          :detached="true"
          :open="studyToolsTimerOpen"
        />
        <AssignmentsModalAdd
          v-if="loggedIn"
          :open="addAssignmentModalExpanded"
          @toggle-modal="$store.commit('TOGGLE_ADD_ASSIGNMENT_MODAL')"
        />
        <ExamsModalAddRedux
          v-if="loggedIn"
          :open="addExamModalExpanded"
          @toggle-modal="$store.commit('TOGGLE_ADD_EXAM_MODAL')"
        />
        <transition name="slide-fade">
          <span
            v-if="loggedIn && !expanded"
            class="icon button is-dark toggle-sidebar"
            title="Toggle sidebar."
            @click="$store.commit('TOGGLE_SIDEBAR')"
          >
            <i
              :class="'fas ' + (expanded ? 'fas fa-chevron-up fa-rotate-270' : 'fas fa-chevron-up fa-rotate-90')"
            />
          </span>
        </transition>
        <div
          class="columns"
          style="margin-right: initial;"
        >
          <transition name="slide-fade">
            <div
              v-if="loggedIn && expanded"
              id="sidebar-column"
              class="column is-3 child-view sidebar-holder"
            >
              <TheSidebar
                ref="sidebar"
                @sidebar-loaded="onResize"
              />
            </div>
          </transition>

          <div
            id="content"
            :class="[loggedIn && expanded ? 'columm' : 'container', {'no-sidebar': !expanded}]"
            style="flex: 1;"
          >
            <PinnedAnnouncements v-if="loggedIn" />
            <transition
              name="fade"
              mode="out-in"
            >
              <router-view />
            </transition>
          </div>
        </div>
      </template>
    </div>
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
    studyToolsTimerOpen () {
      return this.$store.state.studytoolstimer.open && this.$route.name !== 'study-tools-timer';
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
    loggedIn () {
      return this.$store.state.auth.isAuthenticated;
    },
    courses () {
      return this.$store.getters.current_schedule;
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
    isSetup () {
      return this.$store.getters.isUserSetup;
    }
  },
  async mounted () {
    if (typeof window.orientation === 'undefined') {
      window.addEventListener('resize', this.resizeThrottler, false);
    }

    if (this.$route.query.accountLocked) {
      this.loading = false;
      return this.$toasted.error(
        'Your account has been locked by administrators.'
      );
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
      await this.$store.dispatch('GET_UNAVAILABILITIES');
      await this.$store.dispatch('AUTO_UPDATE_SCHEDULE');
      await this.$store.dispatch('AUTO_GET_UPCOMING_WORK');
      await this.$store.dispatch('GET_TODOS');
      await this.$store.dispatch('GET_ANNOUNCEMENTS');
      await this.$store.dispatch('AUTO_UPDATE_NOW');
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
      if (document.getElementById('sidebar-column')) {
        document.getElementById('sidebar').style.width =
          document.getElementById('sidebar-column').offsetWidth - 15 + 'px';
      }
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
}

//Removes annoying outline around elements when clicked.
*:focus {
  outline: none;
  box-shadow: none !important;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0) !important;
}

html,
body {
  height: 100%;
}

/*-------------------------------------------*/
/*             All other styles
/*-------------------------------------------*/

//Sticky Footer
#app {
  display: flex;
  //Dynamically calculate page height - header height (3.25rem)
  min-height: calc(100vh - 3.25rem);
  min-height: -webkit-calc(100vh - 3.25rem);
  flex-direction: column;
}

#content {
  flex: 1 1 auto;
}

#footer {
  flex: 1 0 inherit;
}

// Replace Fullcalendar ugly button style with Bulma's nice style
.fc-button {
  color: initial;
  background: none;
  text-shadow: none;
  //@extend .button;
}

.is-full-width {
  width: 100%;
}

.toggle-sidebar {
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
  opacity: 0;
}

.no-bottom-padding {
  padding-bottom: 0;
}

.modal-content {
  max-width: 800px;
}
</style>
