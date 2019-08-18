<!--Sidebar: Sidebar container-->
<template>
  <aside
    id="sidebar"
    class="menu"
  >
    <div class="panel">
      <p class="panel-heading is-clearfix has-background-dark has-text-white is-unselectable">
        <span
          class="tag icon is-pulled-right local-toggle-sidebar"
          title="Close sidebar"
          @click="$store.commit('TOGGLE_SIDEBAR')"
        >
          <i class="fas fa-angle-left" />
        </span>
        {{ onBreak ? "On Break" : currentTerm.name }}
        <span
          v-if="currentEvent"
          class="tag is-info is-pulled-right tab-count countdown"
          :style="{ 'background-color': currentEvent.course.color }"
          :title="
            'Until end of ' +
              (currentEvent.eventType === 'period' ? 'class' : 'work block')
          "
        >{{ countdown }}</span>
      </p>

      <div
        v-if="!onBreak"
        class="panel-block has-background-white-ter has-text-centered controls"
      >
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
          :class="[name, { 'is-active': tab === name }]"
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

import SidebarSchedule from '@/views/sidebar/components/SidebarSchedule';
import SidebarPressingAssessments from '@/views/sidebar/components/SidebarPressingAssessments';
import SidebarTodoList from '@/views/sidebar/components/SidebarTodoList';
import SidebarCourseList from '@/views/sidebar/components/SidebarCourseList';


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
          name: 'Current Courses',
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
    counts () {
      return {
        schedule: this.$store.getters.todaysAgenda.length,
        assessments: this.pressingAssessments.length,
        courseList: this.courses.length,
        todos: this.todos.length
      };
    },
    currentTab () {
      return this.tabs[this.tab];
    },
    pressingAssessments () {
      return this.$store.getters.limitedUpcomingAssessments
        .filter(
          assessment =>
            assessment.assessmentType === 'exam' ||
            (assessment.assessmentType === 'assignment' &&
            assessment.priority > 0 &&
            !assessment.completed)
        )
        .slice(0, 5);
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
        moment(this.currentEvent.end).diff(this.rightNow)
      );
      return `${diff.hours()}h ${diff.minutes()}m left`;
    },
    todos () {
      return this.$store.state.todos.todos;
    }
  },
  mounted () {},
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
      return moment(this.rightNow).isBetween(event.start, event.end);
    },
    periodType (p) {
      return this.$store.getters.periodType(p.type);
    }
  }
};
</script>

<style lang='scss'>
#sidebar {
  @media only screen and (min-width: 768px) {
    position: sticky;
    width: 100%;
    top: 70px;
    padding: 0;
    //margin-top: 30px;
  }

  .local-toggle-sidebar {
    background-color: white;
    width: 40px;
    i {
      font-size: 15px;
    }
  }
  .local-toggle-sidebar:hover {
    background-color: whitesmoke;
    i {
      transform: translateX(-2px);
    }
  }

  .panel {
    background-color: white;
  }

  .panel-heading {
    border: 1px solid #2e3b59 !important;
  }

  .panel * {
    transition: 0.15s;
  }

  .sidebar-body {
    overflow-x: hidden;
    overflow-y: auto;
    max-height: 50vh;
  }

  //Janky selector for bottom sidebar block
  .panel
    .is-size-7
    div:last-child:not(.control):not(.course-panel-block):not(.event):not(.has-text-grey) {
    border-radius: 0px 0px 4px 4px;
  }

  z-index: 2;

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

  .tab-count {
    margin-left: 3px;
    transform: scale(0.8);
  }
  .local-toggle-sidebar {
    cursor: pointer;
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
    //Prevents overflow but also breaks apart the longer words at lower resolution. Worth it?
    overflow: auto;
  }
  a:hover {
    background-color: #dbdbdb;
  }
}
</style>
