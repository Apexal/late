<template>
  <table class="assessment-table table is-full-width">
    <thead>
      <tr>
        <th>When</th>
        <th>What</th>
        <th>Done</th>
        <th v-if="showRemoveButton" />
      </tr>
    </thead>
    <tbody>
      <tr
        v-for="assessment in assessments"
        :key="assessment._id"
      >
        <td
          class="tooltip"
          :data-tooltip="fromNow(assessment.date)"
        >
          {{ toDateShorterString(assessment.date) }}
          <span
            class="has-text-grey"
          >{{ toTimeString(assessmentDate(assessment)) }}</span>
        </td>
        <td class="exam-course">
          <span @click="$store.commit('OPEN_COURSE_MODAL', course(assessment))">
            <span
              class="assessment-icon fas"
              :class="[ assessment.assessmentType === 'assignment' ? 'fa-clipboard-check' : 'fa-exclamation-triangle' ]"
              :title="course(assessment).longname"
              :style="'color: ' + course(assessment).color"
            />
          </span>

          <router-link
            class="assessment-link"
            :class="assessment.assessmentType"
            :title="assessment.description.substring(0, 500)"
            :to="{ name: assessment.assessmentType + '-overview', params: { [assessment.assessmentType + 'ID']: assessment._id }}"
          >
            {{ assessment.title }}
          </router-link>
        </td>
        <td>
          <span
            v-if="assessment.assessmentType === 'assignment'"
            class="icon"
          >
            <i
              class="fas"
              :class="{ 'fa-check': assessment.completed, 'fa-times': !assessment.completed }"
            />
          </span>
        </td>
        <td v-if="showRemoveButton">
          <a
            class="delete"
            :title="'Delete this' + assessment.assessmentType"
            @click="$emit('remove-assessment', assessment)"
          />
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
    assessmentDate (a) {
      return a.dueDate || a.date;
    },
    fromNow (date) {
      return moment(date).from(this.now);
    },
    toFullDateTimeString: date =>
      moment(date).format('dddd, MMMM Do YYYY, h:mma'),
    toDateShorterString: date => moment(date).format('M/DD/YY'),
    toTimeString: time => moment(time).format('h:mm a')
  }
};
</script>

<style lang="scss" scoped>
.assessment-link {
  color: inherit;
  cursor: pointer;

  &.exam {
    font-weight: 500;
  }
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
.assessment-icon {
  cursor: pointer;
  width: 20px;
  text-align: center;
  margin-right: 5px;
}

.assessment-table {
  th,
  td {
    width: 40%;
    &:nth-child(3) {
      width: 20%;
    }
  }
}
</style>
