<template>
  <div id="app">
    <Header />
    <span
      v-if="loggedIn"
      class="icon button is-black toggle-sidebar"
      @click="$store.commit('TOGGLE_SIDEBAR')"
    >
      <i :class="'fas ' + (expanded ? 'fa-arrow-left' : 'fa-arrow-right')" />
    </span>
    <div class="columns">
      <div
        v-if="loggedIn && expanded"
        class="column is-3"
      >
        <Sidebar />
      </div>
      <div
        :class="(loggedIn && expanded ? 'columm' : 'container') + (expanded ? '' : ' no-sidebar')"
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
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';

import Notifications from '@/components/Notifications';

export default {
  name: 'LATE',
  components: { Header, Sidebar, Footer, Notifications },
  computed: {
    loggedIn () {
      return this.$store.state.auth.isAuthenticated;
    },
    expanded () { return this.$store.state.sidebarExpanded; }
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
</style>
