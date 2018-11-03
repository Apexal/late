<template>
  <div id="app">
    <Header />
    <div class="columns">
      <div
        v-if="loggedIn"
        class="column is-3">
        <Sidebar />
      </div>
      <div class="columm">
        <router-view />
      </div>
    </div>
    <Footer />
  </div>
</template>
<script>
import { mapActions } from 'vuex';

import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';

export default {
  name: 'LATE',
  components: { Header, Sidebar, Footer },
  computed: {
    loggedIn() {
      return this.$store.state.auth.isAuthenticated;
    }
  },
  async created() {
    await this.GET_USER();
    await this.GET_UPCOMING_ASSIGNMENTS();
    //await this.UPDATE_SCHEDULE();
  },
  methods: {
    ...mapActions(['GET_USER', 'GET_UPCOMING_ASSIGNMENTS', 'UPDATE_SCHEDULE'])
  }
};
</script>

<style lang="scss">
/* These styles will apply to the whole app. */
@import "@/assets/bulma.scss";
</style>
