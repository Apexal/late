<template>
  <div class="upcoming-assignments">
    <div
      class="columns is-multiline"
    >
      <div
        v-for="(assignments, date) in filtered"
        :key="date"
        class="due-date column is-one-third-desktop is-half-tablet"
      >
        <div class="panel">
          <p
            class="panel-heading is-unselectable"
            :title="daysAway(date) + ' days away'"
          >
            {{ toDateShortString(date) }}
          </p>
          <div
            v-for="a in assignments"
            :key="a._id"
            :style="{ color: isHighlighted(course(a)) ? 'white !important' : '', 'background-color': isHighlighted(course(a)) ? course(a).color : '' }"
            class="panel-block assignment"
            :class="{ 'is-highlighted': isHighlighted(course(a)), 'is-completed': a.completed }"
          >
            <span class="is-full-width">
              <span class="icon toggle-assignment">
                <span
                  :class="{ 'fas fa-check-circle': a.completed, 'far fa-circle': !a.completed }"
                  :title="course(a).longname"
                  :style="{ 'color': course(a).color }"
                  @click="$emit('toggle-assignment', a._id)"
                />
              </span>
              <router-link
                class="assignment-link "
                :title="a.description.substring(0, 500)"
                :to="{ name: 'assignment-overview', params: { assignmentID: a._id }}"
              >
                <b
                  class="course-title is-hidden-tablet"
                >{{ course(a).longname }}</b>

                {{ a.title }}</router-link>
              <span
                v-if="a.priority >= 7"
                class="tag is-danger"
                title="You marked this assignment as high priority!"
              >!</span>
              <small
                :title="'in ' + hoursFromNow(a.dueDate) + ' hours'"
                class="is-pulled-right"
                :class="{ 'has-text-grey': !isHighlighted(course(a)) }"
              >{{ toTimeString(a.dueDate) }}</small>
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'UpcomingAssignments',
  props: {
    highlighted: {
      type: Array,
      default: () => []
    },
    showCompleted: {
      type: Boolean,
      default: true
    },
    filter: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    filtered () {
      if (this.filter.length === 0) {
        return this.assignmentsGroupedByDueDate;
      } else {
        const filtered = {};
        for (let date in this.assignmentsGroupedByDueDate) {
          filtered[date] = this.assignmentsGroupedByDueDate[date].filter(a => !this.filter.includes(this.course(a).crn));
          if (filtered[date].length === 0) delete filtered[date];
        }
        return filtered;
      }
    },
    assignmentsGroupedByDueDate () {
      return this.$store.getters.assignmentsGroupedByDueDate(false);
    }
  },
  methods: {
    course (a) {
      return this.$store.getters.getCourseFromCRN(a.courseCRN);
    },
    isHighlighted (c) { return this.highlighted.includes(c.crn); },
    toDateShortString (dueDate) {
      if (moment(dueDate).isSame(moment(), 'day')) return 'Today';
      if (moment(dueDate).isSame(moment().add(1, 'day'), 'day')) return 'Tomorrow';
      return moment(dueDate).format('dddd [the] Do');
    },
    toTimeString (dueDate) {
      return moment(dueDate).format('h:mma');
    },
    hoursFromNow: date => moment(date).diff(moment(), 'hours'),
    daysAway: date => moment(date).diff(moment().startOf('day'), 'days')
  }
};
</script>

<style lang="scss" scoped>
.course-title {
  margin-right: 5px;
}

.assignment {
  .assignment-link {
    color: inherit;
  }
  .is-completed {
    text-decoration: line-through;
  }

  .toggle-assignment {
    cursor: pointer;
  }
}

.dot {
  margin-right: 5px;
}
</style>
