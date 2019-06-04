<template>
  <div class="sidebar-pressing-assessments">
    <template v-if="onBreak">
      <div class="no-work">
        <i class="fas fa-umbrella-beach no-work-icon" />
        <div class="panel-block has-text-grey no-hover">
          No work over break!
        </div>
      </div>
    </template>
    <template v-else>
      <div
        v-if="pressing.length == 0"
        class="no-work"
      >
        <i class="far fa-check-square no-work-icon" />
        <div class="panel-block has-text-grey no-hover has-text-centered">
          No pressing assignments or exams!
        </div>
      </div>

      <router-link
        v-for="assessment in pressing"
        v-else
        :key="assessment._id"
        tag="div"
        class="assessment assessment-link panel-block"
        :title="
          assessment.description.substring(0, 500) ||
            `No description for this ${assessment.assessmentType} given.`
        "
        :to="{
          name: assessment.assessmentType + '-overview',
          params: { [assessment.assessmentType + 'ID']: assessment._id }
        }"
        :class="{
          [assessment.assessmentType]: true,
          priority: assessment.priority > 3
        }"
      >
        <span class="is-fullwidth">
          <!-- <i
            class="fas"
            :class="[
              assessment.assessmentType === 'assignment'
                ? 'fas fa-clipboard-check'
                : 'fas fa-exclamation-triangle'
            ]"
            :title="course(assessment).title + ' ' + assessment.assessmentType"
            :style="'color: ' + course(assessment).color"
            @click.prevent="
              $store.commit('OPEN_COURSE_MODAL', course(assessment))
            "
          /> -->

          <CourseAssessmentDot
            :assessment="assessment"
            :course="course(assessment)"
          />
          <b class="course-title is-hidden-tablet">
            {{ course(assessment).title }}
          </b>
          {{ assessment.title }}
          <small
            class="has-text-grey is-pulled-right tooltip is-tooltip-left"
            :data-tooltip="
              longDateTimeFormat(assessment.dueDate || assessment.date)
            "
          >{{ fromNow(assessment.dueDate || assessment.date) }}</small>
        </span>
      </router-link>

      <div class="panel-block has-background-light no-hover">
        <router-link
          :to="{ name: 'coursework-upcoming' }"
          class="button is-fullwidth browseAssessmentsButton"
          title="Browse your coursework"
        >
          Browse Coursework
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
    now () {
      return this.$store.state.now;
    }
  },
  methods: {
    course (a) {
      return this.$store.getters.getCourseFromCRN(a.courseCRN);
    }
  }
};
</script>

<style lang="scss" scoped>
//.fa-clipboard-list {}
.assessment {
  padding: 10px;
  cursor: pointer;

  .course-title {
    margin-left: 5px;
  }

  .assessment-link {
    color: inherit;
  }

  &.exam {
    font-weight: bolder;
  }
}

.browseAssessmentsButton:hover {
  background-color: #f5efef;
}
.browseAssessmentsButton:focus {
  border-color: black;
  box-shadow: none !important;
  -webkit-tap-highlight-color: rgba(0, 0, 0, 0) !important;
}

.no-work {
  i {
    width: 100%;
    text-align: center;
    font-size: 4em;
    padding: 15px 0px 5px 0px;
    display: block;
    color: rgba(128, 128, 128, 0.5);

    border-left: 1px solid #dbdbdb;
    border-right: 1px solid #dbdbdb;
  }

  div {
    display: block;
    width: 100%;
    text-align: center;
  }
}
</style>
