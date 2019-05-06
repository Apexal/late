<template>
  <b-table
    :data="assessments"
  >
    <template slot-scope="props">
      <b-table-column
        field="date"
        label="When"
        class="tooltip"
        :data-tooltip="fromNow(props.row.date)"
      >
        {{ toDateShorterString(props.row.date) }}
        <span
          class="has-text-grey"
        >{{ toTimeString(props.row.date) }}</span>
      </b-table-column>

      <b-table-column
        field="title"
        label="What"
      >
        <CourseAssessmentDot
          :assessment="props.row"
          :course="course(props.row)"
        />
        <router-link
          class="assessment-link"
          :class="assessmentClasses(props.row)"
          :title="assessmentTitle(props.row)"
          :to="{ name: props.row.assessmentType + '-overview', params: { [props.row.assessmentType + 'ID']: props.row._id }}"
        >
          {{ props.row.title }}
        </router-link>
      </b-table-column>
    </template>
  </b-table>
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
    assessmentClasses (assessment) {
      return [assessment.assessmentType, assessment.assessmentType === 'assignment' && assessment.priority === 1 ? 'optional' : ''];
    },
    assessmentTitle (assessment) {
      let title = assessment.assessmentType === 'assignment' && assessment.priority === 1 ? '(optional) ' : '';
      let description = assessment.description.length > 500 ? (assessment.description.substring(0, 500) + '...') : assessment.description;

      title += description || 'No description given.';
      return title;
    },
    capitalize (str) {
      return str.charAt(0).toUpperCase() + str.substring(1, str.length);
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

  &.optional {
    font-style: italic;
  }
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
}

// .assessment-table {
//   th,
//   td {
//     width: 40%;
//     &:nth-child(3) {
//       width: 20%;
//     }
//   }
// }
</style>
