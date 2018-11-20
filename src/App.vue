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
      @click="$store.commit('TOGGLE_SIDEBAR')"
    >
      <i :class="'fas ' + (expanded ? 'fa-arrow-left' : 'fa-arrow-right')" />
    </span>
    <div
      class="columns"
      style="margin-right: initial;"
    >
      <div
        v-if="loggedIn && expanded"
        class="column is-3"
      >
        <Sidebar />
      </div>
      <div
        :class="[loggedIn && expanded ? 'columm' : 'container', {'no-sidebar': !expanded}]"
        style="flex: 1;"
      >
        <Notifications />
        <router-view />
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

import Notifications from '@/components/Notifications';

export default {
  name: 'LATE',
  components: { Header, Sidebar, Footer, AddAssignmentModal, Notifications },
  computed: {
    loggedIn () {
      return this.$store.state.auth.isAuthenticated;
    },
    addAssignmentModalExpanded () { return this.$store.state.addAssignmentModalExpanded; },
    expanded () { return this.$store.state.sidebarExpanded; }
  },
  async created () {
    if (process.env.NODE_ENV === 'development' && !this.$store.state.auth.user.name) {
      const rcsID = prompt('Log in as what user? (rcs_id)');
      await this.$http.get('/students/loginas?rcs_id=' + rcsID);
      await this.$store.dispatch('GET_USER');
    }

    this.$store.dispatch('AUTO_UPDATE_SCHEDULE');
    this.$store.dispatch('AUTO_GET_UPCOMING_ASSIGNMENTS');
  },
  methods: {}
};
</script>

<style lang="scss">
/* These styles will apply to the whole app. */
@import '@/assets/bulma.scss';

.is-full-width {
  width: 100%;
}

.toggle-sidebar {
  z-index: 99;
  position: absolute;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 100%;
  cursor: pointer;
  background-color: green;
  display: inline-block;
}
</style>
