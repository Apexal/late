<template>
  <aside
    id="sidebar"
    class="menu"
  >
    <h3 class="has-text-centered is-size-4 is-hidden-touch">Your itinerary</h3>
    <!--Adds an empty space in place of "your itinerary" on mobile devices-->
    <div
      class="is-hidden-desktop"
      style="height:36px"
    />
    <Schedule />
    <PressingAssignments
      :pressing="pressing"
      @toggle-modal="$store.commit('TOGGLE_ADD_ASSIGNMENT_MODAL')"
    />
    <Todos />
  </aside>
</template>

<script>
import Schedule from '@/components/sidebar/Schedule';
import PressingAssignments from '@/components/sidebar/PressingAssignments';
import Todos from '@/components/sidebar/Todos';

export default {
  name: 'Sidebar',
  components: { PressingAssignments, Schedule, Todos },
  computed: {
    pressing () {
      return this.$store.getters.incompleteUpcomingAssignments.slice(0, 5);
    }
  }
};
</script>

<style lang='scss' scoped>
#sidebar {
  padding: 15px;
}

//Quick QOL panel heading styles
.panel-heading {
  cursor: pointer;
}
.panel-heading:focus {
  outline: none;
}
.panel-heading:hover {
  background-color: #f1eeee;
  transition: 0.1s;
  -webkit-transition: 0.1s;
  -moz-transition: 0.1s;
}
.panel-block:hover {
  background-color: #FDFDFD;
}
</style>
