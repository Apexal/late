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
    assignments () {
      return this.upcomingWeekAssessments.filter(a => a.assessmentType === 'assignment')
    },
    exams () {
      return this.upcomingWeekAssessments.filter(a => a.assessmentType === 'exam')
    }
  },
  watch: {
    startDate2 (newDate) {
      console.log(newDate)
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

</style>
