<template>
  <div id="app">
    <TheHeader />
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
      <AssignmentsAddModal
        :open="addAssignmentModalExpanded"
        @toggle-modal="$store.commit('TOGGLE_ADD_ASSIGNMENT_MODAL')"
      />
      <ExamsModalAdd
        :open="addExamModalExpanded"
        @toggle-modal="$store.commit('TOGGLE_ADD_EXAM_MODAL')"
      />
      <span
        v-if="loggedIn && !expanded"
        class="icon button is-black toggle-sidebar"
        title="Toggle sidebar."
        @click="$store.commit('TOGGLE_SIDEBAR')"
      >
        <i :class="'fas ' + (expanded ? 'fa-arrow-left' : 'fa-arrow-right')" />
      </span>
      <div
        class="columns"
        style="margin-right: initial;"
      >
        <transition name="fade">
          <div
            v-if="loggedIn && expanded"
            class="column is-3 child-view"
          >
            <TheSidebar />
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
import AssignmentsAddModal from '@/components/assignments/AssignmentsAddModal';
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
    AssignmentsAddModal,
    ExamsModalAdd
  },
  data () {
    return {
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
      return this.$store.state.auth.user.is_setup;
    }
  },
  async created () {
    if (
      process.env.NODE_ENV === 'development' &&
      !this.$store.state.auth.isAuthenticated
    ) {
      const rcsID = prompt('Log in as what user? (rcs_id)');
      await this.$http.get('/students/loginas?rcs_id=' + rcsID);
    }

    if (this.$store.state.auth.isAuthenticated) {
      await this.$store.dispatch('GET_TERMS');
      this.$store.dispatch('AUTO_UPDATE_SCHEDULE');
      this.$store.dispatch('AUTO_GET_UPCOMING_WORK');
      this.$store.dispatch('AUTO_UPDATE_NOW');
    }

    this.loading = false;
  },
  methods: {}
};
</script>

<style lang="scss">
/* These styles will apply to the whole app. */
@import "@/assets/bulma.scss";

//Removes annoying outline around elements when clicked.
*:focus {
  outline: none;
}

.is-full-width {
  width: 100%;
}

.toggle-sidebar {
  z-index: 10;
  position: absolute;

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
  transition: opacity 0.3s ease;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.child-view {
  transition: all 0.3s cubic-bezier(0.55, 0, 0.1, 1);
}
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

.no-bottom-padding {
  padding-bottom: 0;
}
</style>
