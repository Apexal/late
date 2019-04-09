<template>
  <div class="sidebar-pressing-assessments">
    <template v-if="onBreak">
      <div class="panel-block has-text-grey">
        There's no work over break!
      </div>
    </template>
    <template v-else>
      <div
        v-if="pressing.length == 0"
        class="panel-block has-text-grey"
      >
        <span class="has-text-centered">No pressing assignments or exams!</span>
      </div>

      <router-link
        v-for="assessment in pressing"
        v-else
        :key="assessment._id"
        tag="div"
        class="assessment assessment-link panel-block"
        :title="assessment.description.substring(0, 500) || `No description for this ${assessment.assessmentType} given.`"
        :to="{ name: assessment.assessmentType + '-overview', params: { [assessment.assessmentType + 'ID']: assessment._id }}"
        :class="{ [assessment.assessmentType]: true, 'priority': assessment.priority > 3 }"
      >
        <span class="is-full-width">
          <i
            class="fas"
            :class="[ assessment.assessmentType === 'assignment' ? 'fas fa-clipboard-check' : 'fas fa-exclamation-triangle' ]"
            :title="course(assessment).longname + ' ' + assessment.assessmentType"
            :style="'color: ' + course(assessment).color"
            @click.prevent="$store.commit('OPEN_COURSE_MODAL', course(assessment))"
          />
          <b class="course-title is-hidden-tablet">{{ course(assessment).longname }}</b>
          {{ assessment.title }}
          <small
            class="has-text-grey is-pulled-right tooltip is-tooltip-left"
            :data-tooltip="toFullDateTimeString(assessment.dueDate || assessment.date)"
          >{{ fromNow(assessment.dueDate || assessment.date) }}</small>
        </span>
      </router-link>

      <div class="panel-block has-background-light">
        <router-link
          to="/assessments/upcoming"
          class="button is-fullwidth browseAssessmentsButton"
          title="Browse assessments"
        >
          Browse Assessments
        </router-link>
      </div>
    </template>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'SidebarPressingAssessments',
  props: {
    pressing: {
      type: Array,
      default: () => [],
      required: true
    }
  },
  computed: {
    onBreak () {
      return this.$store.getters.onBreak;
    },
    now () {
      return this.$store.state.now;
    }
  },
  methods: {
    fromNow (date) {
      return moment(date).from(this.now);
    },
    course (a) {
      return this.$store.getters.getCourseFromCRN(a.courseCRN);
    },
    toFullDateTimeString: date => moment(date).format('ddd, MMM Do YYYY, h:mma')
  }
};
</script>

<style lang="scss" scoped>
.fa-clipboard-list {}
.assessment {
  padding: 10px;
  cursor: pointer;

  .assessment-link {
    color: inherit;
  }

  .course-title {
    margin-left: 5px;
  }

  &.exam {
    font-weight: bolder;
  }
}

.browseAssessmentsButton:hover {
    background-color:#f5efef;
}
.browseAssessmentsButton:focus {
  border-color: black;
  box-shadow: none!important;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0) !important;
}
</style>
