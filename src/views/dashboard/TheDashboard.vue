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

.fc .fc-toolbar > * > * {
  margin: 0 auto;
}

//Vertically "centers" date text w buttons
.fc-left {
  margin-top: 7px;
}

.fc-center,
.fc-right {
  * {
    border-style: none;
    color: #444444;
  }

  .fc-state-active {
    color: black;
  }
  .fc-state-active:nth-child(1) {
    border-right: 1px solid #dbdbdb;
  }
  .fc-state-active:nth-child(2) {
    border-right: 1px solid #dbdbdb;
    border-left: 1px solid #dbdbdb;
  }
  .fc-state-active:nth-child(3) {
    border-left: 1px solid #dbdbdb;
  }

  .fc-button:hover {
    color: black;
  }
  border: 1px solid #dbdbdb;
  border-radius: 4px;
}

.fc-right .fc-button-group {
  border-left: 1px solid #dbdbdb;
  margin-left: 5px;
}

@media only screen and (max-width: 769px) {
  .fc-center {
    margin-top: 10px;
  }
}
</style>
