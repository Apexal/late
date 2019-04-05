<template>
  <aside
    id="sidebar"
    class="menu"
  >
    <div class="panel">
      <p class="panel-heading is-clearfix has-background-dark has-text-white is-unselectable">
        <span
          class="icon button is-white has-text-dark local-toggle-sidebar is-pulled-right"
          title="Toggle sidebar"
          @click="$store.commit('TOGGLE_SIDEBAR')"
        >
          <i class="fas fa-chevron-up fa-rotate-270" />
        </span>
        {{ onBreak ? 'On Break' : currentTerm.name }}
        <span
          v-if="currentEvent"
          class="tag is-info is-pulled-right tab-count countdown"
          :style="{ 'background-color': currentEvent.course.color }"
          :title="'Until end of ' + (currentEvent.eventType === 'period' ? 'class' : 'work block')"
        >{{ countdown }}</span>
      </p>

      <div class="panel-block has-background-white-ter has-text-centered controls">
        <a
          class
          title="Add a new assignment"
          @click="toggleModal('assignment')"
        >
          <span class="icon">
            <i class="fa fa-plus" />
          </span>
          Assignment
        </a>
        <a
          class="s"
          title="Add a new exam"
          @click="toggleModal('exam')"
        >
          <span class="icon">
            <i class="fa fa-plus" />
          </span>
          Exam
        </a>
      </div>

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
            v-if="counts[name]"
            class="tab-count tag is-small"
            :class="'is-' + t.tagColor"
          >{{ counts[name] }}</span>
        </a>
      </p>

      <Component
        :is="currentTab.component"
        class="is-unselectable is-size-7"
        :todays-agenda="todaysAgenda"
        :pressing="pressingAssessments"
        :todos="todos"
        @update-count="updatedCount"
      />
    </div>
  </aside>
</template>

<script>
import moment from 'moment';

import SidebarSchedule from '@/views/components/sidebar/SidebarSchedule';
import SidebarPressingAssessments from '@/views/components/sidebar/SidebarPressingAssessments';
import SidebarTodoList from '@/views/components/sidebar/SidebarTodoList';
import SidebarCourseList from '@/views/components/sidebar/SidebarCourseList';

export default {
  name: 'TheSidebar',
  components: {
    SidebarPressingAssessments,
    SidebarSchedule,
    SidebarTodoList,
    SidebarCourseList
  },
  data () {
    return {
      tab: 'schedule',
      tabs: {
        schedule: {
          component: SidebarSchedule,
          name: 'Today\'s Agenda',
          icon: 'far fa-clock',
          tagColor: 'info'
        },
        assessments: {
          component: SidebarPressingAssessments,
          name: 'Pressing Coursework',
          icon: 'fas fa-list-ul',
          tagColor: 'warning'
        },
        courseList: {
          component: SidebarCourseList,
          name: 'Your Courses',
          icon: 'fas fa-graduation-cap',
          tagColor: 'link'
        },
        todos: {
          component: SidebarTodoList,
          name: 'To-Do List',
          icon: 'fas fa-check',
          tagColor: 'success'
        }
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
        assessments: this.pressingAssessments.length,
        courseList: this.$store.getters.current_schedule.length,
        todos: this.todos.length
      };
    },
    currentTab () {
      return this.tabs[this.tab];
    },
    pressingAssessments () {
      return this.pressingAssignments
        .concat(this.upcomingExamsTwoWeeks)
        .sort((a, b) => {
          const aDate = a.dueDate || a.date;
          const bDate = b.dueDate || b.date;

          if (aDate > bDate) return 1;
          if (aDate < bDate) return -1;
          return 0;
        });
    },
    pressingAssignments () {
      // This filters out optional assignments
      return this.$store.getters.incompleteUpcomingAssignments
        .filter(a => a.priority > 1)
        .slice(0, 5);
    },
    upcomingExamsTwoWeeks () {
      const twoWeeksFromNow = moment().add(2, 'weeks');
      return this.upcomingExams.filter(ex =>
        moment(ex.date).isSameOrBefore(twoWeeksFromNow)
      );
    },
    upcomingExams () {
      return this.$store.getters.pendingUpcomingExams;
    },
    todaysAgenda () {
      return this.$store.getters.todaysAgenda;
    },
    currentEvent () {
      return this.todaysAgenda.find(this.isCurrentEvent);
    },
    countdown () {
      if (!this.currentEvent);

      const diff = moment.duration(
        moment(this.currentEvent.end).diff(this.now)
      );
      return `${diff.hours()}h ${diff.minutes()}m left`;
    },
    todos () {
      return this.$store.state.todos.todos;
    },
    now () {
      return this.$store.state.now;
    }
  },
  mounted () {
    this.$emit('sidebar-loaded');
  },
  methods: {
    updatedCount ({ tab, count }) {
      this.externalCounts[tab] = count;
    },
    toggleModal (assessmentType) {
      switch (assessmentType) {
      case 'assignment':
        this.$store.commit('TOGGLE_ADD_ASSIGNMENT_MODAL');
        break;
      case 'exam':
        this.$store.commit('TOGGLE_ADD_EXAM_MODAL');
        break;
      }
    },
    isCurrentEvent (event) {
      return moment(this.now).isBetween(event.start, event.end);
    },
    periodType (p) {
      return this.$store.getters.periodType(p.type);
    }
  }
};
</script>

<style lang='scss'>
#sidebar {
  .panel {
    background-color: white;
  }

  .panel * {
    transition: 0.15s;
    -webkit-transition: 0.15s;
  }

  .sidebar-body {
    overflow-x: hidden;
    overflow-y: auto;
    max-height: 50vh;
  }

  position: fixed;

  @media only screen and (max-width: 768px) {
    position: initial;
  }

  z-index: 2;
  padding: 15px;

  .panel-tabs {
    display: flex;
    a {
      text-align: center;
      flex: 1;
      color: black;
    }
    a.is-active {
      color: #3273dc;
    }
    a:hover {
      border-bottom: 1px solid black;
    }
  }

  .panel-block:not(.is-active):not(.control):hover {
    background-color: #f3f3f3;
  }

  .tab-count {
    margin-left: 3px;
    transform: scale(0.8);
  }
  .local-toggle-sidebar {
    width: 2.5em;
    height: 1.5em;
  }
  .countdown {
    height: 2.5em;
    width: 6em;
    margin-top: -3px;
    font-weight: 400;
    padding: 2px;
  }
}

.controls {
  display: flex;
  justify-content: space-around;
  padding: 0px !important;

  a:first-child {
    border-right: 1px solid #dbdbdb;
  }
  a {
    flex: 0 0 50%;
    color: #4a4a4a;
    padding: 5px;
    span.icon {
      margin: 0;
    }
  }
  a:hover {
    background-color: #dbdbdb;
  }
}
</style>
