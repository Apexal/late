<!--Assessments: Upcoming assessments list-->
<template>
  <div class="assessments-upcoming">
    <AssignmentsOverdue />
    <p
      v-if="none"
      class="has-text-centered has-text-grey"
    >
      No upcoming assignments or exams
      <i
        v-if="!showCompleted"
        style="font-style:inherit"
      >matching your filters</i>
      for the next 2 weeks!
    </p>

    <AssessmentsUpcomingWeek
      v-for="(assessments, week) in assessmentsEachWeek"
      :key="week"
      :week-number="parseInt(week)"
      :week-assessments="assessments"
    />

    <div
      v-if="filteredFarFutureAssessments.length > 0"
      class="far-future-assignments"
    >
      <p class="has-text-centered has-text-grey">
        {{ filteredFarFutureAssessments.length }} far future items
        {{ showingFutureAssessments ? "shown" : "hidden" }}
        <a
          @click="showingFutureAssessments = !showingFutureAssessments"
        >Toggle</a>
      </p>

      <AssessmentsTable
        v-if="showingFutureAssessments"
        :assessments="filteredFarFutureAssessments"
        empty-message="No assignments or exams due in over 2 weeks."
      />
    </div>
    <p
      v-else
      class="has-text-centered has-text-grey"
    >
      No far future assignments after 3 weeks.
    </p>
  </div>
</template>

<script>
import moment from 'moment'

import AssignmentsOverdue from '@/views/assessments/components/upcoming/AssignmentsOverdue'
import AssessmentsUpcomingWeek from '@/views/assessments/components/upcoming/AssessmentsUpcomingWeek'
import AssessmentsTable from '@/views/assessments/components/AssessmentsTable.vue'

export default {
  name: 'AssessmentsUpcoming',
  components: { AssignmentsOverdue, AssessmentsUpcomingWeek, AssessmentsTable },
  props: {
    showCompleted: {
      type: Boolean,
      default: true
    },
    showScheduled: {
      type: Boolean,
      required: false
    }
  },
  data () {
    return {
      showingFutureAssessments: false
    }
  },
  computed: {
    none () {
      return Object.keys(this.filteredLimitedAssessments).length === 0
    },
    assessmentsEachWeek () {
      const weeks = {}
      const thisWeek = moment().startOf('week')

      for (const assessment of this.filteredLimitedAssessments) {
        const weeksAway = moment(assessment.date).diff(thisWeek, 'week')

        if (!(weeksAway in weeks)) weeks[weeksAway] = []
        weeks[weeksAway].push(assessment)
      }

      return weeks
    },
    filteredLimitedAssessments () {
      return this.$store.getters.limitedUpcomingAssessments.filter(
        assessment => {
          if (assessment.assessmentType === 'assignment') {
            if (!this.showCompleted && assessment.completed) return false
          }
          return true
        }
      )
    },
    farFutureUpcomingAssessments () {
      return this.$store.getters.farFutureUpcomingAssessments
    },
    filteredFarFutureAssessments () {
      return this.farFutureUpcomingAssessments.filter(assessment => {
        if (assessment.assessmentType === 'assignment') {
          if (!this.showCompleted && assessment.completed) return false
        }
        return true
      })
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
