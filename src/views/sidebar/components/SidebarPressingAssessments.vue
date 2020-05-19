<!--Sidebar: Pressing Assignments module-->
<template>
  <div
    ref="sidebar-pressing-assessments"
    class="sidebar-pressing-assessments"
  >
    <template v-if="onBreak">
      <div class="no-items panel-block has-text-grey">
        <i class="fas fa-umbrella-beach no-items-icon" />
        No work over break!
      </div>
    </template>
    <template v-else>
      <div
        v-if="pressing.length === 0"
        class="no-items panel-block has-text-grey"
      >
        <i class="far fa-check-square no-items-icon" />
        No pressing assignments or exams!
      </div>

      <router-link
        v-for="assessment in pressing"
        v-else
        :key="assessment._id"
        tag="div"
        class="assessment assessment-link panel-block"
        :data-assessment-i-d="assessment.id"
        :data-assessment-type="assessment.assessmentType"
        :title="
          (assessment.description || '').substring(0, 500) ||
            `No description for this ${assessment.assessmentType} given.`
        "
        :to="{
          name: assessment.assessmentType + '-overview',
          params: {[assessment.assessmentType + 'ID']: assessment._id}
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
          />-->

          <CourseAssessmentDot
            :assessment="assessment"
            :course="course(assessment)"
          />
          <b class="course-title is-hidden-tablet">{{ course(assessment).title }}</b>
          {{ assessment.title }}
          <i
            v-if="
              assessment.assessmentType === 'assignment' && assessment.shared
            "
            class="fas fa-users has-text-grey-light"
            title="Shared assignment"
          />
          <small
            class="has-text-grey is-pulled-right tooltip has-tooltip-left"
            :data-tooltip="
              longDateTimeFormat(assessment.dueDate || assessment.date)
            "
          >{{ fromNow(assessment.dueDate || assessment.date) }}</small>
        </span>
      </router-link>

      <div class="panel-block has-background-light">
        <router-link
          :to="{name: 'coursework-upcoming'}"
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
import { Draggable } from '@fullcalendar/interaction'

export default {
  name: 'SidebarPressingAssessments',
  props: {
    pressing: {
      type: Array,
      default: () => [],
      required: true
    }
  },
  data () {
    return {
      draggable: null
    }
  },
  mounted () {
    this.draggable = new Draggable(this.$refs['sidebar-pressing-assessments'], {
      itemSelector: '.assessment-link',
      eventData: (eventEl) => {
        return {
          eventType: 'new-assessment-block',
          title: 'Drop to schedule',
          assessmentID: eventEl.dataset.assessmentID,
          assessmentType: eventEl.dataset.assessmentType,
          duration: { hours: 1 },
          create: true
        }
      }
    })
  },
  methods: {
    course (a) {
      return this.$store.getters.getCourseFromCRN(a.courseCRN)
    }
  }
}
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
</style>
