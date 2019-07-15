<!--Dashboard: Main dashboard container-->
<template>
  <section class="section dasboard">
    <h1 class="is-hidden-desktop has-text-centered is-marginless title">
      Your Dashboard
    </h1>

    <div class="tabs is-centered">
      <ul>
        <h1
          class="is-hidden-touch title"
          style="flex: 1"
        >
          Your Dashboard
        </h1>
        <router-link
          :to="{ name: 'dashboard-overview' }"
          tag="li"
        >
          <a>Overview</a>
        </router-link>
        <router-link
          :to="{ name: 'dashboard-calendar' }"
          tag="li"
        >
          <a>Calendar</a>
        </router-link>
      </ul>
    </div>
    <template v-if="onBreak">
      <h2 class="subtitle">
        On Break
      </h2>
    </template>
    <router-view v-else />
  </section>
</template>

<script>
import DashboardOverview from './DashboardOverview';
import DashboardCalendar from './DashboardCalendar';

export default {
  name: 'TheDashboard',
  components: { DashboardOverview, DashboardCalendar },
  computed: {
    tab () {
      return this.$route.hash.substring(1) || 'calendar';
    }
  }
};
</script>

<style lang='scss'>
.tabs .title {
  margin: 0;
}
.work-block-event {
  border-width: 3px !important;
}

.dashboard-calendar-select-modal .panel {
  .assessment-type-tag {
    text-transform: capitalize;
    color: white;
  }
  b {
    font-weight: normal;
  }
  .panel-block {
    background-color: white;
    cursor: pointer;
  }
}
</style>
