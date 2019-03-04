<template>
  <table class="table is-full-width">
    <thead>
      <tr>
        <th class="is-hidden-mobile">
          Course
        </th>
        <th>Assignment</th>
        <th>Due</th>
        <th>
          <span class="is-hidden-touch">Completed</span>
        </th>
        <th
          v-if="showRemoveButton"
          class="is-hidden-touch"
        />
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="a in assignments"
        :key="a._id"
      >
        <td
          class="is-hidden-mobile"
          @click="$store.commit('OPEN_COURSE_MODAL', course(a))"
        >
          <span
            class="dot course-dot"
            :title="course(a).longname"
            :style="'background-color: ' + course(a).color"
          />
          <b class="course-title">{{ course(a).longname }}</b>
        </td>
        <td>
          <span
            class="dot course-dot is-hidden-tablet"
            :title="course(a).longname"
            :style="'background-color: ' + course(a).color"
            @click="$store.commit('OPEN_COURSE_MODAL', course(a))"
          />
          <router-link
            class="assignment-link"
            :title="a.description.substring(0, 500)"
            :to="{name: 'assignments-overview', params: { assignmentID: a._id }}"
          >
            {{ a.title }}
          </router-link>
        </td>
        <td :title="toFullDateTimeString(a.dueDate)">
          {{ toDateShorterString(a.dueDate) }}
          <span
            class="has-text-grey"
          >{{ toTimeString(a.dueDate) }}</span>
        </td>
        <td>
          <span class="icon">
            <i
              class="fas"
              :class="{ 'fa-check': a.completed, 'fa-times': !a.completed }"
            />
          </span>
        </td>
        <td
          v-if="showRemoveButton"
          class="is-hidden-touch"
        >
          <button
            class="button is-danger tooltip"
            data-tooltip="Remove Assignment"
            @click="$emit('remove-assignment', a)"
          >
            Remove
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import moment from 'moment';

export default {
  name: 'AssignmentsTable',
  props: {
    showRemoveButton: {
      type: Boolean,
      default: false
    },
    assignments: {
      type: Array,
      required: true
    }
  },
  methods: {
    course (a) {
      return this.$store.getters.getCourseFromCRN(a.courseCRN);
    },
    toFullDateTimeString: dueDate =>
      moment(dueDate).format('dddd, MMMM Do YYYY, h:mma'),
    toDateShorterString: dueDate => moment(dueDate).format('M/DD/YY'),
    toTimeString: time => moment(time).format('h:mm a')
  }
};
</script>

<style lang="scss" scoped>
.course-title {
  cursor: pointer;
}
.course-dot {
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
