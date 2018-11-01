<template>
  <div id="app">
    <Header />
    <div id="nav">
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </div>
    <router-view />
    <Footer />
  </div>
</template>
<script>
import { mapActions, mapMutations } from 'vuex';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default {
  name: 'LATE',
  components: { Header, Footer },
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
@import '@/assets/bulma.scss';
</style>
