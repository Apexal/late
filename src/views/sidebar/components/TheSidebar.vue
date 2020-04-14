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
          :style="{'background-color': currentEvent.course.color}"
          :title="
            'Until end of ' +
              (currentEvent.eventType === 'period' ? 'class' : 'work block')
          "
        >{{ countdown }}</span>
      </p>

      <div
        v-if="!onBreak"
        class="has-background-white-ter has-text-centered controls"
      >
        <a
          class="button is-small is-light"
          title="Add a new assignment"
          @click="toggleModal('assignment')"
        >
          <span class="icon">
            <i class="fa fa-plus" />
          </span>
          <span>Add Assignment</span>
        </a>
        <a
          class="button is-small is-light"
          title="Add a new exam"
          @click="toggleModal('exam')"
        >
          <span class="icon">
            <i class="fa fa-plus" />
          </span>
          <span>Add Exam</span>
        </a>
      </div>

      <p class="panel-tabs is-unselectable">
        <a
          v-for="(t, name) in tabs"
          :key="name"
          class="tooltip"
          :class="[name, {'is-active': tab === name}]"
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
        :todos="allTodos"
        @update-count="updatedCount"
      />
    </div>
  </aside>
</template>

<script>
import moment from 'moment'

import SidebarSchedule from '@/views/sidebar/components/SidebarSchedule'
import SidebarPressingAssessments from '@/views/sidebar/components/SidebarPressingAssessments'
import SidebarTodoList from '@/views/sidebar/components/todo/SidebarTodoList'
import SidebarCourseList from '@/views/sidebar/components/SidebarCourseList'
import PollPages from '@/views/polls/PollPages'

export default {
  name: 'TheSidebar',
  components: {
    SidebarPressingAssessments,
    SidebarSchedule,
    SidebarTodoList,
    SidebarCourseList,
    PollPages
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
        },
        polls: {
          component: PollPages,
          name: 'Polls',
          icon: 'fas fa-poll',
          tagColor: 'link'
        }
      }
    }
  },
  computed: {
    counts () {
      return {
        schedule: this.$store.getters.todaysAgenda.length,
        assessments: this.pressingAssessments.length,
        courseList: this.courses.length,
        todos: this.incompleteTodos.length,
        polls: this.$store.state.polls.unvoted
      }
    },
    currentTab () {
      return this.tabs[this.tab]
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
        .slice(0, 5)
    },
    todaysAgenda () {
      return this.$store.getters.todaysAgenda
    },
    currentEvent () {
      return this.todaysAgenda.find(this.isCurrentEvent)
    },
    countdown () {
      if (!this.currentEvent) return

      let { start, end } = this.currentEvent
      if (typeof start === 'string') {
        start = moment(start, 'HH:mm', true)
        end = moment(end, 'HH:mm', true)
      }

      const diff = moment.duration(
        moment(end).diff(this.rightNow)
      )
      return `${diff.hours()}h ${diff.minutes()}m left`
    },
    incompleteTodos () {
      return this.$store.state.todos.todos.filter(t => !t.completed)
    },
    allTodos () {
      return this.$store.state.todos.todos
    }
  },
  methods: {
    updatedCount ({ tab, count }) {
      this.externalCounts[tab] = count
    },
    toggleModal (assessmentType) {
      switch (assessmentType) {
        case 'assignment':
          this.$store.commit('TOGGLE_ADD_ASSIGNMENT_MODAL')
          break
        case 'exam':
          this.$store.commit('TOGGLE_ADD_EXAM_MODAL')
          break
      }
    },
    isCurrentEvent (event) {
      let { start, end } = event
      if (typeof start === 'string') {
        start = moment(start, 'HH:mm', true)
        end = moment(end, 'HH:mm', true)
      }
      return moment(this.rightNow).isBetween(start, end)
    },
    periodType (p) {
      return this.$store.getters.periodType(p.type)
    }
  }
}
</script>

<style lang='scss'>
#sidebar {

  // Sticky sidebar when on desktop-sized screen
  @media only screen and (min-width: 768px) {
    position: sticky;
    width: 100%;
    top: 70px;
    padding: 0;
  }

  .local-toggle-sidebar {
    cursor: pointer;
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

  // Everything is smooth!
  .panel * {
    transition: 0.15s;
  }

  // Prevents a sidebar tab with a long stack of items from growing past the bottom edge of the screen
  .sidebar-body {
    overflow-x: hidden;
    overflow-y: auto;
    max-height: 50vh;
  }

  // //Janky selector for bottom sidebar block
  // .panel
  //   .is-size-7
  //   div:last-child:not(.control):not(.course-panel-block):not(.event):not(.has-text-grey) {
  //   border-radius: 0px 0px 4px 4px;
  // }

  z-index: 2;

  // Stretch the sidebar panel tabs out
  .panel-tabs {
    display: flex;
    a {
      text-align: center;
      flex: 1;
    }
  }

  .tab-count {
    margin-left: 3px;
    transform: scale(0.8);
  }

  .countdown {
    height: 2.5em;
    width: 6em;
    margin-top: -3px;
    font-weight: 400;
    padding: 2px;
  }

  .no-items {
    flex-direction: column;

    .no-items-icon {
      width: 100%;
      text-align: center;
      font-size: 4em;
      padding: 15px 0px 5px 0px;
      display: block;
    }
  }
}

// The "Add Assignment" and "Add Exam" buttons at the top of the sidebar
.controls {
  display: flex;

  .button {
    flex: 1;
  }
}

//Remove class countdown on tablet sized screens to free up room
@media (min-width:768px) and (max-width:1000px) {
  #sidebar .countdown { display: none; }
}
</style>
