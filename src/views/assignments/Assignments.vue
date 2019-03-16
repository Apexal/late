<template>
  <section class="section assignment-list">
    <h1 class="is-hidden-desktop has-text-centered is-marginless title">
      {{ title }}
    </h1>

    <div class="tab-nav tabs is-centered">
      <ul>
        <h1
          class="is-hidden-touch title"
          style="flex: 1"
        >
          {{ title }}
        </h1>

        <router-link
          tag="li"
          to="/assignments/upcoming"
          title="Switch to view upcoming assignments"
        >
          <a>Upcoming</a>
        </router-link>
        <router-link
          tag="li"
          to="/assignments/past"
          title="Switch to view past assignments"
        >
          <a>Previous</a>
        </router-link>

        <router-link
          tag="li"
          to="/assignments/calendar"
          title="Switch to view your assignment calendar"
        >
          <a>Calendar</a>
        </router-link>
      </ul>
    </div>

    <AssessmentsFilter
      :filter="filter"
      :show-show-completed="true"
      :show-completed="showCompleted"
      :show-group-by="view === 'assignments-upcoming'"
      :group-by="groupBy"
      @toggle-filter="toggleFilter"
      @toggle-show-completed="showCompleted = !showCompleted"
      @change-group-by="groupBy = $event"
    />

    <transition
      name="slide-left"
      mode="out-in"
    >
      <router-view
        class="child-view"
        :group-by="groupBy"
        :show-completed="showCompleted"
        :filter="filter"
        @toggle-assignment="toggleAssignment"
      />
    </transition>
    <hr>
    <button
      class="button is-dark"
      title="Add an upcoming assignment"
      @click="$store.commit('TOGGLE_ADD_ASSIGNMENT_MODAL')"
    >
      Add Assignment
    </button>
  </section>
</template>

<script>
import AssessmentsFilter from '@/views/components/assessment/AssessmentsFilter';

export default {
  name: 'Assignments',
  components: { AssessmentsFilter },
  data () {
    return {
      groupBy: 'dueDate',
      showCompleted: true,
      filter: []
    };
  },
  computed: {
    view () {
      return this.$route.name;
    },
    title () {
      return this.$route.meta.title;
    }
  },
  watch: {
    showCompleted (nowShowing) {
      if (nowShowing) {
        this.$toasted.info('Now including completed assignments.', {
          icon: 'toggle-on',
          duration: 1000,
          fullWidth: false,
          position: 'top-right'
        });
      } else {
        this.$toasted.error('Now excluding completed assignments.', {
          icon: 'toggle-off',
          duration: 1000,
          fullWidth: false,
          position: 'top-right'
        });
      }

      localStorage.setItem('assignmentsShowCompleted', nowShowing);
    },
    groupBy (newGroupBy) {
      localStorage.setItem('assignmentsGroupBy', newGroupBy);
    }
  },
  mounted () {
    if (localStorage.getItem('assignmentsShowCompleted')) {
      try {
        this.showCompleted = JSON.parse(
          localStorage.getItem('assignmentsShowCompleted')
        );
      } catch (e) {
        localStorage.removeItem('assignmentsShowCompleted');
      }
    }
    if (localStorage.getItem('assignmentsGroupBy')) {
      try {
        this.groupBy = localStorage.getItem('assignmentsGroupBy');
        if (this.groupBy !== 'course' && this.groupBy !== 'dueDate') {
          throw new Error(
            'Invalid value for assignmentsGroupBy in localStorage'
          );
        }
      } catch (e) {
        alert(e);
        localStorage.removeItem('assignmentsGroupBy');
      }
    }
  },
  methods: {
    async toggleAssignment (assignmentID) {
      try {
        const toggledAssignment = await this.$store.dispatch(
          'TOGGLE_UPCOMING_ASSIGNMENT',
          assignmentID
        );
        this.$toasted.show(`Toggled assignment '${toggledAssignment.title}'.`, {
          icon: toggledAssignment.completed ? 'check-circle' : 'circle',
          action: {
            text: 'View',
            push: {
              name: 'assignments-overview',
              params: { assignmentID }
            }
          }
        });
      } catch (e) {
        return this.$toasted.error(e.response.data.message);
      }
    },
    toggleFilter (c) {
      if (this.filter.includes(c.crn)) {
        this.filter.splice(this.filter.indexOf(c.crn), 1);
        this.$toasted.info(`Showing '${c.longname}' assignments.`, {
          icon: 'plus',
          position: 'top-right',
          fullWidth: false,
          duration: 1000
        });
      } else {
        this.filter.push(c.crn);
        this.$toasted.error(`Hiding '${c.longname}' assignments.`, {
          icon: 'minus',
          position: 'top-right',
          fullWidth: false,
          duration: 1000
        });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.level .disable-shrink {
  flex-shrink: initial;
}

@media only screen and (max-width: 768px) {
  .buttons.assignment-view-buttons {
    float: unset !important;
  }

  .level-left + .level-right {
    margin-top: 5px !important;
  }
}

.tab-nav {
  margin-bottom: 0;
  .title {
    margin: 0;
  }
}
</style>
