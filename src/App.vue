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
import { mapActions, mapGetters } from 'vuex';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default {
  name: 'LATE',
  components: { Header, Footer },
  created() {
    this.GET_USER();
    this.GET_UPCOMING_ASSIGNMENTS();
  },
  methods: {
    ...mapActions(['GET_USER', 'GET_UPCOMING_ASSIGNMENTS']),
    ...mapGetters(['UPDATE_SCHEDULE'])
  }
};
</script>

<style lang="scss">
/* These styles will apply to the whole app. */
@import "@/assets/bulma.scss";
</style>
