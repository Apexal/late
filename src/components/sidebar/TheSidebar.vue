<template>
  <aside
    id="sidebar"
    class="menu"
  >
    <h3 class="has-text-centered is-size-4 is-hidden-touch">
      Your itinerary
    </h3>
    <!--Adds an empty space in place of "your itinerary" on mobile devices-->
    <div
      class="is-hidden-desktop"
      style="height:36px"
    />
    <SidebarSchedule />
    <SidebarPressingAssignments
      :pressing="pressingAssignments"
      @toggle-modal="$store.commit('TOGGLE_ADD_ASSIGNMENT_MODAL')"
    />
    <SidebarUpcomingExamsList :upcoming="upcomingExams" />
    <SidebarTodoList />
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
  computed: {
    pressingAssignments () {
      return this.$store.getters.incompleteUpcomingAssignments.slice(0, 5);
    },
    upcomingExams () { return this.$store.state.work.upcomingExams; }
  }
};
</script>

<style lang='scss'>
#sidebar {
  padding: 15px;

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
}
</style>
