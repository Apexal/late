<template>
  <section class="section assignment-list">
    <div class="assignment-view-buttons buttons has-addons is-pulled-right">
      <router-link
        class="button"
        to="/assignments/upcoming"
        title="Switch to view upcoming assignments."
      >Upcoming</router-link>
      <router-link
        class="button"
        to="/assignments/past"
        title="Switch to view past assignments."
      >Past</router-link>
      <router-link
        class="button"
        to="/assignments/calendar"
        title="Switch to view your assignment calendar."
      >Calendar</router-link>
    </div>
    <h1 class="title">{{ title }}</h1>

    <div class="level box assignment-controls">
      <div class="level-left disable-shrink">
        <div class="filters">
          <span
            v-for="c in courses"
            :key="c.listing_id"
            class="tag is-white course-tag level-item is-unselectable"
            :title="`Click to toggle filtering out ${c.longname} assignments.`"
            :class="{ 'has-text-grey-light filtered': isFiltered(c) }"
            @click="toggleFilter(c)"
          >
            <span
              class="dot course-dot"
              :style="{ 'background-color': c.color }"
            />
            {{ c.longname }}</span>
        </div>
      </div>
      <div class="level-right">
        <div class="field">
          <label class="checkbox is-unselectable">
            <input
              v-model="showCompleted"
              type="checkbox"
            >
            Show Completed
          </label>
        </div>
      </div>
    </div>
    <hr>
    <transition
      name="slide-left"
      mode="out-in"
    >
      <router-view
        class="child-view"
        :show-completed="showCompleted"
        :filter="filter"
        @toggle-assignment="toggleAssignment"
      />
    </transition>
  </section>

</template>

<script>
export default {
  name: 'Assignments',
  data () {
    return {
      showCompleted: true,
      filter: []
    };
  },
  computed: {
    view () { return this.$route.name; },
    title () { return this.$route.meta.title; },
    courses () { return this.$store.state.auth.user.current_schedule; }
  },
  methods: {
    async toggleAssignment (assignmentID) {
      try {
        await this.$store.dispatch('TOGGLE_UPCOMING_ASSIGNMENT', assignmentID);
      } catch (e) {
        return this.$store.dispatch('ADD_NOTIFICATION', {
          type: 'danger',
          description: e.response.data.message
        });
      }
    },
    course (a) {
      return this.$store.getters.getCourseFromCRN(a.courseCRN);
    },
    isFiltered (c) { return this.filter.includes(c.crn); },
    toggleFilter (c) {
      if (this.filter.includes(c.crn)) { this.filter.splice(this.filter.indexOf(c.crn), 1); } else { this.filter.push(c.crn); }
    }
  }
};
</script>

<style lang="scss" scoped>
span.tag.course-tag {
  cursor: pointer;
  font-weight: bold;
}

span.dot.course-dot {
  margin-right: 2px;
}

.level .disable-shrink {
  flex-shrink: initial;
}

.assignment-controls {
  padding: 10px !important;
}

@media only screen and (max-width: 768px) {
  .buttons.assignment-view-buttons {
    float: unset !important;
  }

  .level-left + .level-right {
    margin-top: 5px !important;
  }
}
</style>
