<template>
  <div class="home">
    <Dashboard v-if="loggedIn" />
    <section
      v-else
      class="section"
    >
      <h2 class="title">Welcome to LATE</h2><img
        id="late-image"
        class="image is-pulled-right"
        src="https://rcos.io/uploads/apexal/late/ADuF2L6adeNaC9TcL8oTMyVG.png"
      >
      <div class="content">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus cursus metus at enim bibendum, vel auctor ligula porttitor. Vivamus sollicitudin eget velit ac luctus. Nullam et porttitor lacus. Integer id metus tempor, sagittis sem vitae, dapibus nibh. Vestibulum vitae metus neque. Fusce vitae consectetur risus. Praesent tempus libero et finibus sodales. Aliquam luctus tellus vel sapien varius, ut malesuada orci tempor. Sed mollis sit amet ante eget vehicula. In blandit sem aliquam, maximus nisi vel, cursus justo. Duis euismod convallis magna, ut tempor nulla blandit ut. Aliquam eros enim, accumsan ut varius finibus, dignissim scelerisque sapien.
        </p>
        <p>Aliquam id malesuada risus. Nullam nec eros a magna placerat porta. Donec vestibulum gravida elit ut suscipit. Ut ut libero a tellus elementum cursus et vitae est. Mauris massa mauris, sollicitudin sed turpis eget, laoreet posuere justo. Nam ut arcu at ipsum molestie dictum quis sed est. Aenean tincidunt lacinia elit vitae mattis. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia Curae; Mauris a ex et turpis mattis imperdiet a aliquam elit.</p>
      </div>
    </section>
  </div>
</template>

<script>
import Dashboard from '@/views/Dashboard';

export default {
  name: 'Home',
  components: { Dashboard },
  computed: {
    loggedIn () { return this.$store.state.auth.isAuthenticated; }
  }
};
</script>

<style lang="scss" scoped>
#late-image {
  max-width: 400px;
}
</style>

