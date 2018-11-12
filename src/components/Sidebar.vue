<template>
  <aside
    id="sidebar"
    class="menu"
  >
    <AddAssignmentModal
      :open="addAssignmentModalOpen"
      @toggle-modal="addAssignmentModalOpen = !addAssignmentModalOpen"
    />
    <Schedule />
    <PressingAssignments
      :pressing="pressing"
      @toggle-modal="addAssignmentModalOpen = !addAssignmentModalOpen"
    />
  </aside>
</template>

<script>
import AddAssignmentModal from '@/components/assignments/AddAssignmentModal';
import Schedule from '@/components/sidebar/Schedule';
import PressingAssignments from '@/components/sidebar/PressingAssignments';

export default {
  name: 'Sidebar',
  components: { AddAssignmentModal, PressingAssignments, Schedule },
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
