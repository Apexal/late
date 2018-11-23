<template>
  <aside
    id="sidebar"
    class="menu"
  >
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
  data () {
    return {
      addAssignmentModalOpen: false
    };
  },
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
</style>
