<template>
  <div
    class="tile is-child notification dashboard-overview-courseload"
    :class="courseLoad.className"
  >
    <p class="title is-marginless">
      Next Week's Courseload
    </p>
    <p class="is-size-2 course-load">
      {{ courseLoad.title }}
    </p>
    <span class="counts">{{ assignments.length }} assignments | {{ exams.length }} exams | <router-link
      tag="b"
      :to="{name: 'coursework-upcoming'}"
    >Browse</router-link></span>

    <div
      v-if="importantAssessments.length > 0"
      class="important-assessments"
    >
      <strong>You specifically marked these as important</strong>
      <ol>
        <router-link
          v-for="a in importantAssessments"
          :key="a._id"
          tag="li"
          :to="assessmentLink(a)"
          class="is-capitalized"
        >
          <strong>{{ course(a).title }} {{ a.assessmentType }}</strong>:
          {{ a.title }}
        </router-link>
      </ol>
    </div>
  </div>
</template>

<script>
import moment from 'moment'

import courseloads from '@/modules/courseloads'

export default {
  name: 'DashboardOverviewCourseload',
  computed: {
    courseLoad () {
      return courseloads.determineWeight(this.upcomingWeekAssessments)
    },
    startDate () {
      const start = moment(this.rightNow)
      while (start.day() !== 0) {
        alert('add 1 day')
        start.add(1, 'day')
      }
      return start.startOf('day')
    },
    upcomingWeekAssessments () {
      return this.$store.state.assessments.upcomingAssessments.filter(assessment => moment(assessment.date).isBetween(this.startDate, moment(this.startDate).add(1, 'week')))
    },
    importantAssessments () {
      return this.upcomingWeekAssessments.filter(ass => (ass.assessmentType === 'assignment' && ass.priority === 5) || (ass.assessmentType === 'exam' && ass.priority === 3))
    },
    assignments () {
      return this.upcomingWeekAssessments.filter(a => a.assessmentType === 'assignment')
    },
    exams () {
      return this.upcomingWeekAssessments.filter(a => a.assessmentType === 'exam')
    }
  },
  methods: {
    course (assessment) {
      return this.$store.getters.getCourseFromCRN(assessment.courseCRN)
    },
    assessmentLink (assessment) {
      return {
        name: assessment.assessmentType + '-overview',
        params: {
          [assessment.assessmentType + 'ID']: assessment.id
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>

.course-load {
  font-weight: 300;
}

.counts {
  cursor: pointer;
}

.important-assessments {
  margin-top: 1em;

  ol {
    margin-left: 20px;

    li {
      cursor: pointer;
    }
  }
}

</style>
