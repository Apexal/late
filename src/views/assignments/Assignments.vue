<template>
  <section class="section assignment-list">
    <div class="buttons has-addons is-pulled-right">
      <router-link
        class="button"
        to="/assignments/upcoming"
      >Upcoming</router-link>
      <router-link
        class="button"
        to="/assignments/past"
      >Past</router-link>
      <router-link
        class="button"
        to="/assignments/calendar"
      >Calendar</router-link>
    </div>
    <h1 class="title">{{ title }}</h1>

    <div class="level box">
      <div class="level-left disable-shrink">
        <div class="filters">
          <span
            v-for="c in courses"
            :key="c.listing_id"
            :style="`background-color: ${c.color}; color: white;`"
            class="tag course-tag level-item"
            :class="{'highlighted': isHighlighted(c)}"
            @mouseover="addHighlight(c)"
            @mouseleave="removeHighlight(c)"
          >{{ c.longname }}</span>
        </div>
      </div>
      <div class="level-right">
        <div class="field">
          <label class="checkbox">
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

    <router-view
      :highlighted="highlighted"
      :show-completed="showCompleted"
    />
  </section>

</template>

<script>
export default {
  name: 'Assignments',
  data () {
    return {
      showCompleted: true,
      highlighted: []
    };
  },
  computed: {
    view () { return this.$route.name; },
    title () { return this.$route.meta.title; },
    courses () { return this.$store.state.auth.user.current_schedule; }
  },
  methods: {
    course (a) {
      return this.$store.getters.getCourseFromCRN(a.courseCRN);
    },
    isHighlighted (c) { return this.highlighted.includes(c.crn); },
    addHighlight (c) { if (!this.isHighlighted(c)) this.highlighted.push(c.crn); },
    removeHighlight (c) { if (this.isHighlighted(c)) this.highlighted.splice(this.highlighted.indexOf(c.crn), 1); }
  }
};
</script>

<style lang="scss" scoped>
span.tag.course-tag {
  cursor: pointer;
  margin-right: 5px;
  &.highlighted {
    font-weight: bold;
  }
}

.level .disable-shrink {
  flex-shrink: initial;
}
</style>
