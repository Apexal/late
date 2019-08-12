<!--Dashboard: Main dashboard container-->
<template>
  <section class="section dasboard">
    <h1 class="is-hidden-desktop has-text-centered is-marginless title">
      {{ onBreak ? `On Break${nextTerm ? (' - ' + nextTerm.name + ' Sneak Peek') : ''}` : "Your Dashboard" }}
    </h1>

    <div class="tabs is-centered">
      <ul>
        <h1
          class="is-hidden-touch title"
          style="flex: 1"
        >
          {{ onBreak ? `On Break${nextTerm ? (' - ' + nextTerm.name + ' Sneak Peek') : ''}` : "Your Dashboard" }}
        </h1>
        <router-link
          v-if="!onBreak"
          :to="{ name: 'dashboard-overview' }"
          tag="li"
        >
          <a>Overview</a>
        </router-link>
        <router-link
          v-if="!onBreak"
          :to="{ name: 'dashboard-calendar' }"
          tag="li"
        >
          <a>Calendar</a>
        </router-link>
      </ul>
    </div>
    <DashboardNextTermPreview v-if="onBreak && nextTerm" />
    <template v-else-if="onBreak">
      <h2 class="subtitle">
        Enjoy your break! LATE will be here for you when you return!
      </h2>
      <hr>
      <router-link
        :to="{ name: 'account' }"
        class="button is-dark"
      >
        Continue Account Setup
      </router-link>
    </template>
    <router-view v-else />
  </section>
</template>

<script>
import DashboardOverview from './DashboardOverview';
import DashboardCalendar from './DashboardCalendar';

import DashboardNextTermPreview from './components/DashboardNextTermPreview';

export default {
  name: 'TheDashboard',
  components: { DashboardOverview, DashboardCalendar, DashboardNextTermPreview },
  computed: {
    tab () {
      return this.$route.hash.substring(1) || 'calendar';
    },
    nextTerm () {
      return this.$store.getters.nextTerm;
    }
  }
};
</script>

<style lang='scss'>
.tabs .title {
  margin: 0;
}
</style>
