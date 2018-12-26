<template>
  <aside
    id="sidebar"
    class="menu"
  >
    <div class="panel">
      <p class="panel-heading is-clearfix has-background-dark has-text-white is-unselectable">
        <span
          class="icon button is-black local-toggle-sidebar is-pulled-right"
          title="Toggle sidebar."
          @click="$store.commit('TOGGLE_SIDEBAR')"
        >
          <i class="fas fa-arrow-left" />
        </span>
        {{ onBreak ? 'On Break' : currentTerm.name }}
      </p>

      <p class="panel-tabs is-unselectable">
        <a
          v-for="(t, name) in tabs"
          :key="name"
          class="tooltip"
          :class="{'is-active': tab === name}"
          :data-tooltip="t.name"
          @click="tab = name"
        >
          <i :class="t.icon" />

          <span
            v-if="name === 'schedule' && inClass"
            class="tag is-info tooltip is-pulled-right tab-count"
            :style="{ 'background-color': schedule.current.course.color }"
            :data-tooltip="'Until end of ' + schedule.current.course.longname + ' ' + periodType(schedule.current.period)"
          >
            {{ countdown }}
          </span>
          <span
            v-else-if="counts[name]"
            class="tab-count tag is-small is-danger"
          >
            {{ counts[name] }}
          </span>
        </a>
      </p>
      <transition
        name="fade"
        mode="out-in"
      >
        <Component
          :is="current_tab.component"
          :upcoming="upcomingExams"
          :pressing="pressingAssignments"
          @toggle-modal="toggleModal"
          @update-count="updatedCount"
        />
      </transition>
    </div>
  </aside>
</template>

<script>
import moment from 'moment';

import SidebarSchedule from '@/components/sidebar/SidebarSchedule';
import SidebarPressingAssignments from '@/components/sidebar/SidebarPressingAssignments';
import SidebarUpcomingExamsList from '@/components/sidebar/SidebarUpcomingExamsList';
import SidebarTodoList from '@/components/sidebar/SidebarTodoList';

export default {
  name: 'TheSidebar',
  components: {
    SidebarPressingAssignments,
    SidebarSchedule,
    SidebarTodoList,
    SidebarUpcomingExamsList
  },
  data () {
    return {
      tab: 'schedule',
      tabs: {
        schedule: {
          component: SidebarSchedule,
          name: 'Daily Agenda',
          icon: 'far fa-clock'
        },
        assignments: {
          component: SidebarPressingAssignments,
          name: 'Pressing Assignments',
          icon: 'fas fa-clipboard-list'
        },
        exams: {
          component: SidebarUpcomingExamsList,
          name: 'Upcoming Exams',
          icon: 'fas fa-file-alt'
        },
        todos: {
          component: SidebarTodoList,
          name: 'To Do\'s',
          icon: 'fas fa-check'
        }
      },
      externalCounts: {
        todos: 0
      }
    };
  },
  computed: {
    onBreak () {
      return this.$store.getters.onBreak;
    },
    currentTerm () {
      return this.$store.getters.currentTerm;
    },
    counts () {
      return {
        assignments: this.pressingAssignments.length,
        exams: this.upcomingExams.length,
        todos: this.externalCounts.todos
      };
    },
    current_tab () {
      return this.tabs[this.tab];
    },
    pressingAssignments () {
      return this.$store.getters.incompleteUpcomingAssignments.slice(0, 5);
    },
    upcomingExams () {
      return this.$store.getters.pendingUpcomingExams;
    },
    schedule () {
      return this.$store.state.schedule;
    },
    inClass () {
      return this.$store.getters.inClass;
    },
    countdown () {
      const currentPeriod = this.$store.state.schedule.current.period;
      const diff = moment.duration(
        moment(currentPeriod.end, 'Hmm', true).diff(this.now)
      );
      return `${diff.hours()}h ${diff.minutes()}m left`;
    }
  },
  methods: {
    updatedCount ({ tab, count }) {
      this.externalCounts[tab] = count;
    },
    toggleModal () {
      switch (this.tab) {
      case 'assignments':
        this.$store.commit('TOGGLE_ADD_ASSIGNMENT_MODAL');
        break;
      case 'exams':
        this.$store.commit('TOGGLE_ADD_EXAM_MODAL');
        break;
      }
    },
    periodType (p) {
      return this.$store.getters.periodType(p.type);
    }
  }
};
</script>

<style lang='scss'>
#sidebar {
  z-index: 5;
  padding: 15px;

  .panel-tabs {
    display: flex;
    a {
      text-align: center;
      flex: 1;
    }
  }

  .panel-block {
    transition: 0.3s;
    &:hover {
      background-color: rgb(250, 250, 250);
    }
  }

  .tab-count {
    margin-left: 3px;
    font-size: 70%;
    padding: 5px;
  }
  .local-toggle-sidebar {
    width: 2.5em;
    height: 1.5em;
  }
}
</style>
