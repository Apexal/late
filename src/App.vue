<template>
  <div id="app">
    <Header />
    <AddAssignmentModal
      :open="addAssignmentModalExpanded"
      @toggle-modal="$store.commit('TOGGLE_ADD_ASSIGNMENT_MODAL')"
    />
    <span
      v-if="loggedIn"
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
          <Sidebar />
        </div>
      </transition>
      <div
        id="content"
        :class="[loggedIn && expanded ? 'columm' : 'container', {'no-sidebar': !expanded}]"
        style="flex: 1;"
      >
        <section
          v-if="!$route.path.includes('/profile') && !isSetup"
          class="section no-bottom-padding"
        >
          <div class="notification is-notice">
            <b>NOTICE:</b> You will not be able to use
            <b>LATE</b> until you have
            <router-link to="/profile">
              set up your account
            </router-link> or logged in.
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
    <Footer />
  </div>
</template>
<script>
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Sidebar from '@/components/sidebar/Sidebar';
import AddAssignmentModal from '@/components/assignments/AddAssignmentModal';

export default {
  name: 'LATE',
  components: { Header, Sidebar, Footer, AddAssignmentModal },
  computed: {
    loggedIn () {
      return this.$store.state.auth.isAuthenticated;
    },
    addAssignmentModalExpanded () {
      return this.$store.state.addAssignmentModal.expanded;
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
      !this.$store.state.auth.user.name
    ) {
      const rcsID = prompt('Log in as what user? (rcs_id)');
      await this.$http.get('/students/loginas?rcs_id=' + rcsID);
      await this.$store.dispatch('GET_USER');
    }

    this.$store.dispatch('AUTO_UPDATE_SCHEDULE');
    this.$store.dispatch('AUTO_GET_UPCOMING_ASSIGNMENTS');
    this.$store.dispatch('AUTO_UPDATE_NOW');
  },
  methods: {}
};
</script>

<style lang="scss">
/* These styles will apply to the whole app. */
@import "@/assets/bulma.scss";

.is-full-width {
  width: 100%;
}

.toggle-sidebar {
  z-index: 10;
  position: absolute;

  //Styling the toggle button to fit the theme
  background-color: #f5f5f5!important; //Bulma overrides background-color, color, and border
  color: black!important;
  border: 1px solid #dbdbdb!important;
  margin: 1em;
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
