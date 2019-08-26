<template>
  <div
    class="tile is-child notification dashboard-overview-courseload"
    :class="courseLoad.className"
  >
    <p class="subtitle is-marginless">
      Next 7-Day Courseload
    </p>
    <p class="is-size-2">
      {{ courseLoad.title }}
    </p>
    <span class="counts">{{ assignments.length }} assignments | {{ exams.length }} exams | <router-link
      tag="b"
      :to="{name: 'coursework-upcoming'}"
    >Browse</router-link></span>
  </div>
</template>

<script>
import moment from 'moment'

import courseloads from '@/modules/courseloads'

export default {
  name: 'DashboardOverviewCourseload',
  computed: {
    courseLoad () {
      return courseloads.determineWeight(this.assignments.length, this.exams.length)
    },
    upcomingWeekAssessments () {
      const limit = moment().add(7, 'days').endOf('day')
      return this.$store.state.assessments.upcomingAssessments.filter(assessment => moment(assessment.date).isSameOrBefore(limit))
    },
    assignments () {
      return this.upcomingWeekAssessments.filter(a => a.assessmentType === 'assignment')
    },
    exams () {
      return this.upcomingWeekAssessments.filter(a => a.assessmentType === 'exam')
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
