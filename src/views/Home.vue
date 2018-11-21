<template>
  <div class="home">
    <Dashboard v-if="!loggedIn" />
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
          <b>LATE</b> is an automatic time scheduler that, given your assignments with rough time estimates, and your calendar will:
          <ul>
            <li>automatically allocate study/work time throughout your schedule</li>
            <li>allow you to adjust the personal schedule made for you each week</li>
            <li>readjust itself and your calendar if you fall off track</li>
            <li><span class="has-text-grey">(optionally)</span>keep you updated on your work and progress with weekly progress emails</li>
            <li><span class="has-text-grey">(optionally)</span> interact with you through text messages to remind you to study/work at the proper times</li>
            <li><span class="has-text-grey">(optionally)</span> interact with you through a variety of integrations including Discord and Slack</li>
          </ul>
        </p>
        <p>
          <b>LATE</b> is a free, open-source project made by RPI students for RPI students only. It integrates with YACS and SIS to be much more than a
          personal scheduling assistant.
        </p>
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

