<template>
  <table class="assessment-table table is-full-width">
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
        v-for="a in assessments"
        :key="a._id"
      >
        <td
          class="tooltip"
          :data-tooltip="fromNow(a.date)"
        >
          {{ toDateShorterString(a.date) }}
        </td>
        <td
          class="exam-course is-hidden-mobile"
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
          <router-link
            tag="td"
            class="assessment-link"
            :title="a.description.substring(0, 500)"
            :to="{ name: 'assessment-overview', params: { id: a._id }}"
          >
            <span
              class="dot is-hidden-tablet"
              :title="course(a).longname"
              :style="'background-color: ' + course(a).color"
              @click.prevent="$store.commit('OPEN_COURSE_MODAL', course(a))"
            />
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
  name: 'AssessmentsTable',
  props: {
    showRemoveButton: {
      type: Boolean,
      default: false
    },
    dateFormat: {
      type: String,
      default: 'dddd [the] Do'
    },
    assessments: {
      type: Array,
      required: true
    }
  },
  methods: {
    course (a) {
      return this.$store.getters.getCourseFromCRN(a.courseCRN);
    },
    fromNow (date) {
      return moment(date).from(this.now);
    },
    toFullDateTimeString: dueDate =>
      moment(dueDate).format('dddd, MMMM Do YYYY, h:mma'),
    toDateShorterString: dueDate => moment(dueDate).format('M/DD/YY'),
    toTimeString: time => moment(time).format('h:mm a')
  }
};
</script>

<style lang="scss" scoped>
.assessment-link {
  color: inherit;
  cursor: pointer;
}
.course-dot {
  margin-right: 5px;
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
