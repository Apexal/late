<template>
  <aside
    id="sidebar"
    class="menu"
  >
    <div class="panel">
      <p class="panel-heading is-clearfix has-background-dark has-text-white is-unselectable">
        <span
          class="icon button is-white has-text-dark local-toggle-sidebar is-pulled-right"
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
            v-if="name === 'schedule' && currentEvent"
            class="tag is-info is-pulled-right tab-count"
            :style="{ 'background-color': currentEvent.course.color }"
            :title="'Until end of ' + currentEvent.title"
          >
            {{ countdown }}
          </span>
          <span
            v-else-if="counts[name]"
            class="tab-count tag is-small"
            :class="'is-' + t.tagColor"
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
          :upcoming="upcomingExamsOneMonth"
          :pressing="pressingAssignments"
          @toggle-modal="toggleModal"
          @update-count="updatedCount"
          @update-current-event="currentEvent = arguments[0]"
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
      currentEvent: false,
      tabs: {
        schedule: {
          component: SidebarSchedule,
          name: 'Daily Agenda',
          icon: 'far fa-clock',
          tagColor: 'info'
        },
        assignments: {
          component: SidebarPressingAssignments,
          name: 'Pressing Assignments',
          icon: 'fas fa-clipboard-list',
          tagColor: 'warning'
        },
        exams: {
          component: SidebarUpcomingExamsList,
          name: 'Upcoming Exams',
          icon: 'fas fa-file-alt',
          tagColor: 'danger'
        },
        todos: {
          component: SidebarTodoList,
          name: 'To Do\'s',
          icon: 'fas fa-check',
          tagColor: 'info'
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
        schedule: this.$store.getters.todaysAgenda.length,
        assignments: this.pressingAssignments.length,
        exams: this.upcomingExamsOneMonth.length,
        todos: this.externalCounts.todos
      };
    },
    current_tab () {
      return this.tabs[this.tab];
    },
    pressingAssignments () {
      return this.$store.getters.incompleteUpcomingAssignments.slice(0, 5);
    },
    upcomingExamsOneMonth () {
      const monthFromNow = moment().add(1, 'month');
      return this.upcomingExams.filter(ex => moment(ex.date).isSameOrBefore(monthFromNow));
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
      if (!this.currentEvent);

      const diff = moment.duration(
        moment(this.currentEvent.end).diff(this.now)
      );
      return `${diff.hours()}h ${diff.minutes()}m left`;
    }
  },
  mounted () {
    if (localStorage.getItem('todos')) {
      try {
        const todos = JSON.parse(localStorage.getItem('todos'));
        this.updatedCount({ tab: 'todos', count: todos.length });
      } catch (e) {
        localStorage.removeItem('todos');
      }
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
