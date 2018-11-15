<template>
  <div class="past-assignments">
    <table class="table is-full-width">
      <thead>
        <tr>
          <th>Due</th>
          <th class="is-hidden-mobile">Course</th>
          <th>Assignment</th>
          <th>Completed</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="a in filtered"
          :key="a._id"
          :class="{'highlighted': isHighlighted(course(a)) }"
          :style="{ color: isHighlighted(course(a)) ? 'white !important' : '', 'background-color': isHighlighted(course(a)) ? course(a).color : '' }"
        >
          <td :title="toFullDateTimeString(a.dueDate)">{{ toDateShorterString(a.dueDate) }}</td>
          <td class="is-hidden-mobile">
            <span
              class="dot"
              :title="course(a).longname"
              :style="'background-color: ' + course(a).color"
            />
            <b
              class="course-title"
            >{{ course(a).longname }}</b>
          </td>
          <td>
            <span
              class="dot is-hidden-tablet"
              :title="course(a).longname"
              :style="'background-color: ' + course(a).color"
            />
            <router-link
              class="assignment-link"
              :title="a.description.substring(0, 500)"
              :to="{name: 'assignment-overview', params: { assignmentID: a._id }}"
            >
              {{ a.title }}
            </router-link>

          </td>
          <td>
            <span class="icon">
              <i
                class="fas"
                :class="{ 'fa-check': a.computed, 'fa-times': !a.Completed }"
              />
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'PastAssignments',
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
      if (this.filter.length === 0) { return this.pastAssignments; } else { return this.pastAssignments.filter(a => !this.filter.includes(this.course(a).crn)); }
    },
    pastAssignments () { return this.$store.getters.pastAssignments; }
  },
  methods: {
    course (a) {
      return this.$store.getters.getCourseFromCRN(a.courseCRN);
    },
    isHighlighted (c) { return this.highlighted.includes(c.crn); },
    toFullDateTimeString: dueDate => moment(dueDate).format('dddd, MMMM Do YYYY, h:mma'),
    toDateShorterString (dueDate) { return moment(dueDate).format('MM/DD/YY'); }
  }
};
</script>

<style lang="scss" scoped>
.dot {
  margin-right: 5px;
}

.assignment-link {
  color: inherit;
}

.fas {
  &.fa-check {
    color: green;
  }

  &.fa-times {
    color: red;
  }
}
</style>
