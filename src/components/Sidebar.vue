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
  </aside>
</template>

<script>
import Schedule from '@/components/sidebar/Schedule';
import PressingAssignments from '@/components/sidebar/PressingAssignments';

export default {
  name: 'Sidebar',
  components: { PressingAssignments, Schedule },
  data () {
    return {
      addAssignmentModalOpen: false
    };
  },
  computed: {
    pressing () {
      return this.$store.getters.pressingAssignments(5);
    }
  }
};
</script>

<style lang='scss' scoped>
#sidebar {
  padding: 15px;
}
</style>
