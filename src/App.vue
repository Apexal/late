<template>
  <div id="app">
    <vue-progress-bar />
    <TheHeader ref="header" />
    <Loading
      :active.sync="loading"
      :is-full-page="true"
    />
    <template v-if="loggedIn">
      <CourseModal
        :open="courseModalOpen"
        :course="courseModalData"
      />
    </template>
    <template v-if="!loading">
      <AssignmentsModalAdd
        :open="addAssignmentModalExpanded"
        @toggle-modal="$store.commit('TOGGLE_ADD_ASSIGNMENT_MODAL')"
      />
      <ExamsModalAdd
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
          <i :class="'fas ' + (expanded ? 'fa-arrow-left' : 'fa-arrow-right')" />
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
          <section
            v-if="loggedIn && !$route.path.includes('/profile') && !isSetup"
            class="section no-bottom-padding"
          >
            <div class="notification is-warning">
              <b>NOTICE:</b> You will not be able to use
              <b>LATE</b> until you have
              <router-link to="/profile">
                set up your account.
              </router-link>
            </div>
          </section>
          <transition
            name="fade"
            mode="out-in"
          >
            <router-view />
          </transition>
        </div>
      </div>
    </template>
    <TheFooter />
  </div>
</template>
<script>
import TheHeader from '@/components/TheHeader';
import TheFooter from '@/components/TheFooter';
import TheSidebar from '@/components/sidebar/TheSidebar';
import AssignmentsModalAdd from '@/components/assignments/AssignmentsModalAddRedux';
import ExamsModalAdd from '@/components/exams/ExamsModalAdd';
import CourseModal from '@/components/courses/CourseModal';

import Loading from 'vue-loading-overlay';
import 'vue-loading-overlay/dist/vue-loading.css';

export default {
  name: 'LATE',
  components: {
    Loading,
    CourseModal,
    TheHeader,
    TheSidebar,
    TheFooter,
    AssignmentsModalAdd,
    ExamsModalAdd
  },
  data () {
    return {
      resizeTimeout: null,
      loading: true
    };
  },
  computed: {
    courseModalData () {
      return this.$store.state.courseModal.current;
    },
    courseModalOpen () {
      return this.$store.state.courseModal.open;
    },
    loggedIn () {
      return this.$store.state.auth.isAuthenticated;
    },
    courses () {
      return this.$store.getters.current_schedule;
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
      await this.$store.dispatch('AUTO_UPDATE_SCHEDULE');
      await this.$store.dispatch('AUTO_GET_UPCOMING_WORK');
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
/* These styles will apply to the whole app. */
@import "@/assets/bulma.scss";

// Replace Fullcalendar ugly button style with Bulma's nice style
.fc-button {
  color: initial;
  background: none;
  text-shadow: none;
  @extend .button;
}

//Removes annoying outline around elements when clicked.
*:focus {
  outline: none;
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

.dot {
  width: 10px;
  height: 10px;
  border-radius: 100%;
  cursor: pointer;
  background-color: green;
  display: inline-block;
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

.sidebar-holder {
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
  transition: all .2s ease;
}
.slide-fade-leave-active {
  transition: all .15s cubic-bezier(1.0, 0.5, 0.8, 1.0);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateX(-80px);
  opacity: 0;
}


.no-bottom-padding {
  padding-bottom: 0;
}
</style>
