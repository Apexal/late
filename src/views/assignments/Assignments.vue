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
        <li>
          <router-link
            class
            to="/assignments/upcoming"
            title="Switch to view upcoming assignments"
          >
            Upcoming
          </router-link>
        </li>
        <li>
          <router-link
            to="/assignments/past"
            title="Switch to view past assignments"
          >
            Previous
          </router-link>
        </li>
        <li>
          <router-link
            to="/assignments/calendar"
            title="Switch to view your assignment calendar"
          >
            Calendar
          </router-link>
        </li>
      </ul>
    </div>

    <div class="level box assignment-controls">
      <div class="level-left disable-shrink">
        <div class="filters">
          <span
            class="subtitle is-6"
            style="margin-right: 5px; width: 8em;"
          >Filter:</span>
          <span
            v-for="c in courses"
            :key="c.original_longname"
            class="tag is-white course-tag level-item is-unselectable"
            :class="{ 'filtered-out filtered': isFiltered(c) }"
            :style="{ 'background-color': c.color }"
            @click="toggleFilter(c)"
          >
            <!--Removed :title="`Filter ${c.longname} assignments`" for ease of use-->
            <span>{{ c.longname }}</span>
          </span>
        </div>
      </div>
    </div>

    <div class="level-right has-text-centered">
      <div class="">
        <label
          class="checkbox is-unselectable tooltip show-completed-toggle"
          data-tooltip="Toggle completed assignments."
        >
          <input
            v-model="showCompleted"
            type="checkbox"
          >
          Show Completed
        </label>
      </div>
      <div
        v-if="view === 'assignments-upcoming'"
        class="select group-by-select"
      >
        <select v-model="groupBy">
          <option value="dueDate">
            Group by Due Date
          </option>
          <option value="course">
            Group by Course
          </option>
        </select>
      </div>
    </div>
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
export default {
  name: 'Assignments',
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
    },
    courses () {
      return this.$store.getters.current_schedule;
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
    isFiltered (c) {
      return this.filter.includes(c.crn);
    },
    toggleFilter (c) {
      if (this.filter.includes(c.crn)) {
        this.filter.splice(this.filter.indexOf(c.crn), 1);
        this.$toasted.info(`Now including '${c.longname}' assignments.`, {
          icon: 'plus',
          position: 'top-right',
          fullWidth: false,
          duration: 1000
        });
      } else {
        this.filter.push(c.crn);
        this.$toasted.error(`No longer showing '${c.longname}' assignments.`, {
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

.level-right {
  margin-bottom: 1.5rem;
}

.assignment-controls {
  padding: 10px !important;
}

span.tag.course-tag {
  cursor: pointer;
  //font-weight: bold;
  margin: 0;
  margin-left: 2px;
  margin-right: 2px;
  color: white;
  span {
    max-width: 150px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: 0.3s;
    -webkit-transition: 0.3s;
    transition-delay: 0.1s;
    -webkit-transition-delay: 0.1s;
  }

  span:hover {
    max-width: 100vw;
    transition: 0.4s;
    -webkit-transition: 0.4s;
    //transition-delay:0.3s;
  }
}

span.tag.course-tag:hover {
  opacity: 0.8;
}

.filtered-out {
  color: #686868 !important;
  background-color: rgb(214, 214, 214) !important;
}

span.dot.course-dot {
  margin-right: 2px;
}

.level .disable-shrink {
  flex-shrink: initial;
}

.level-right .box {
  padding: 5px;
  margin: 0;
  display: inline-block;
}

.group-by-select {
  margin-left: 10px;
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
  .title {
    margin: 0;
  }
  .is-active {
    border-bottom-color: #3273dc;
    color: #3273dc;
  }
}
</style>
