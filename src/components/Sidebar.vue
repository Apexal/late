<template>
  <aside
    id="sidebar"
    class="menu">
    <AddAssignmentModal
      :open="addAssignmentModalOpen"
      @toggle-modal="addAssignmentModalOpen = !addAssignmentModalOpen" />
    <Schedule />
    <div class="panel sidebar-upcoming-assignments">
      <p class="panel-heading is-clearfix">Pressing Assignments
        <span class="is-pulled-right icon">
          <i
            class="fas fa-plus add-assignment"
            @click="addAssignmentModalOpen = !addAssignmentModalOpen"/>
        </span>
      </p>
      <div
        v-for="a in pressing"
        :key="a._id"
        class="assignment panel-block">
        <router-link
          :to="{ name: 'assignment-overview', params: { assignmentID: a._id }}"
          tag="span"
          class="is-full-width">
          {{ a.title }}
          <span
            v-if="a.priority >= 7"
            class="tag is-danger priority-tag">!</span>
          <small class="is-pulled-right has-text-grey">{{ getCourseFromCRN(a.courseCRN).longname }}</small>
        </router-link>
      </div>
      <div class="panel-block">
        <router-link
          tag="b"
          to="/assignments">View All Assignments</router-link>
      </div>
    </div>
  </aside>
</template>

<script>
import Schedule from '@/components/Schedule';
import AddAssignmentModal from '@/components/assignments/AddAssignmentModal';

export default {
  name: 'Sidebar',
  components: { AddAssignmentModal, Schedule },
  data () {
    return {
      addAssignmentModalOpen: false
    };
  },
  computed: {
    pressing() {
      return this.$store.getters.pressingAssignments(5);
    }
  },
  methods: {
    getCourseFromCRN(crn) {
      return this.$store.getters.getCourseFromCRN(crn);
    }
  }
};
</script>

<style lang='scss' scoped>
#sidebar {
  padding: 15px;

  .assignment {
    cursor: pointer;
    .priority-tag {
      margin-left: 5px;
    }
  }

  .add-assignment {
    cursor: pointer;
  }
}
</style>
