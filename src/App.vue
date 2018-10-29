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
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default {
  name: 'LATE',
  components: { Header, Footer }
};
</script>

<style lang="scss">
  /* These styles will apply to the whole app. */

</style>
