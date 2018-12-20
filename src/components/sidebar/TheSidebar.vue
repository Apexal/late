<template>
  <aside
    id="sidebar"
    class="menu"
  >
    <div class="panel">
      <p class="panel-heading is-clearfix has-background-black-ter has-text-white">
        Your Itinerary
      </p>

      <p class="panel-tabs">
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
            v-if="tab === name"
            class="is-hidden-touch"
          >
            {{ t.name }}
          </span>
          <span
            v-if="counts[name]"
            class="tab-count tag is-small is-danger"
          >
            {{ counts[name] }}
          </span>
        </a>
      </p>
      <Component
        :is="current_tab.component"
        :upcoming="upcomingExams"
        :pressing="pressingAssignments"
        @toggle-modal="toggleModal"
        @update-count="updatedCount"
      />
    </div>
  </aside>
</template>

<script>
import SidebarSchedule from '@/components/sidebar/SidebarSchedule';
import SidebarPressingAssignments from '@/components/sidebar/SidebarPressingAssignments';
import SidebarUpcomingExamsList from '@/components/sidebar/SidebarUpcomingExamsList';
import SidebarTodoList from '@/components/sidebar/SidebarTodoList';

export default {
  name: 'TheSidebar',
  components: { SidebarPressingAssignments, SidebarSchedule, SidebarTodoList, SidebarUpcomingExamsList },
  data () {
    return {
      tab: 'schedule',
      tabs: {
        'schedule': { component: SidebarSchedule, name: 'Daily Agenda', icon: 'far fa-clock' },
        'assignments': { component: SidebarPressingAssignments, name: 'Pressing Assignments', icon: 'fas fa-clipboard-list' },
        'exams': { component: SidebarUpcomingExamsList, name: 'Upcoming Exams', icon: 'fas fa-file-alt' },
        'todos': { component: SidebarTodoList, name: 'To Do\'s', icon: 'fas fa-check' }
      },
      externalCounts: {
        'todos': 0
      }
    };
  },
  computed: {
    counts () {
      return {
        'assignments': this.pressingAssignments.length,
        'exams': this.upcomingExams.length,
        'todos': this.externalCounts.todos
      };
    },
    current_tab () {
      return this.tabs[this.tab];
    },
    pressingAssignments () {
      return this.$store.getters.incompleteUpcomingAssignments.slice(0, 5);
    },
    upcomingExams () { return this.$store.getters.pendingUpcomingExams; }
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
    }
  }
};
</script>

<style lang='scss'>
#sidebar {
  padding: 15px;
  margin-top: 30px;
  // QOL panel heading styles
  .panel-heading {
    cursor: pointer;
    background-color: #f1eeee;

    &:focus {
      outline: none;
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
}
</style>
