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
        <li
          :class="{ 'is-active': tab === 'overview' }"
          @click="tab = 'overview'"
        >
          <a
            title="(WIP) View your weekly schedule"
            style="cursor: not-allowed;"
          >Your Week</a>
        </li>
        <li
          :class="{ 'is-active': tab === 'calendar' }"
          title="View calendar"
          @click="tab = 'calendar'"
        >
          <a>Calendar</a>
        </li>
      </ul>
    </div>
    <template v-if="onBreak">
      <h2 class="subtitle">
        On Break
      </h2>
    </template>
    <DashboardOverview v-else-if="tab === 'overview'" />
    <DashboardCalendar v-else-if="tab === 'calendar'" />
  </section>
</template>

<script>
import DashboardOverview from '@/views/dashboard/DashboardOverview';
import DashboardCalendar from '@/views/dashboard/DashboardCalendar';

export default {
  name: 'TheDashboard',
  components: { DashboardOverview, DashboardCalendar },
  data () {
    return {
      tab: 'calendar'
    };
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

  .fc-button {
    outline: 0;
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

#calendar-holder {
  height: 700px;
  .show-fullscreen {
    display: none;
  }
  &:fullscreen {
    padding: 15px;
    background-color: white;
    height: 95%;
    .show-fullscreen {
      display: initial;
    }
    .hide-fullscreen {
      display: none;
    }
  }
}
.fullscreen-toggle {
  float: right;
  margin-top: -35px;
  z-index: 10;
}
</style>
