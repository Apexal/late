
<!--Stats: Bar Chart module-->
<template>
  <div
    v-if="!loading"
    class="charts"
  >
    <canvas id="bar-chart" />
  </div>
</template>

<script>
/* eslint-disable no-new */
import moment from 'moment'
import Chart from 'chart.js'

export default {
  name: 'StatsBar',
  data () {
    return {
      newCategory: '',
      categories: [],
      loading: true
    }
  },
  computed: {
    assignmentCountDataset () {
      const data = this.courses.map(
        course =>
          this.assignments.filter(
            assignment => assignment.courseCRN === course.crn
          ).length
      )

      return {
        label: '# of assignments and exams',
        data,
        backgroundColor: this.courses.map(course => course.color),
        borderColor: 'white', // this.courses.map(course => course.color),
        borderWidth: 1
      }
    },
    scheduledTimeDataSet () {
      const data = this.courses.map(course =>
        this.assignments
          .filter(assignment => assignment.courseCRN === course.crn)
          .map(assignment => assignment.scheduledTime)
          .reduce((acc, duration) => acc + duration, 0)
      )

      return {
        label: 'minutes',
        data,
        backgroundColor: this.courses.map(course => course.color),
        borderColor: 'white', // this.courses.map(course => course.color),
        borderWidth: 1
      }
    },
    assignmentsOverWeekDataset () {
      const data = [0, 0, 0, 0, 0, 0, 0] // [ # of assignments due Sunday, # of assignments due Monday, ... ]
      for (const assignment of this.assignments) {
        const day = moment(assignment.dueDate).day()
        data[day] += 1
      }

      return {
        label: '# of assignments',
        data,
        backgroundColor: 'grey',
        borderColor: 'white', // this.courses.map(course => course.color),
        borderWidth: 1,
        group: 'total'
      }
    },
    assignmentsOverWeekPerCourseDatasets () {
      const datasets = []

      for (const course of this.courses) {
        const assignments = this.assignments.filter(
          assignment => assignment.courseCRN === course.crn
        )

        const data = [0, 0, 0, 0, 0, 0, 0] // [ # of assignments due Sunday, # of assignments due Monday, ... ]
        for (const assignment of assignments) {
          const day = moment(assignment.dueDate).day()
          data[day] += 1
        }

        datasets.push({
          label: course.title,
          data,
          backgroundColor: course.color,
          borderColor: 'white', // this.courses.map(course => course.color),
          borderWidth: 1,
          group: 'total'
        })
      }

      return datasets
    },
    weekLabels () {
      const weekLabels = []

      const end = moment(this.currentTerm.endDate).endOf('week')
      const current = moment(this.currentTerm.startDate).startOf('week')

      while (current.isBefore(end)) {
        weekLabels.push(current.format('[Week of] MMMM Do'))
        current.add(1, 'week')
      }

      return weekLabels
    },
    assignmentsDueOverTermDataset () {
      const data = []

      const end = moment(this.currentTerm.endDate).endOf('week')
      const current = moment(this.currentTerm.startDate).startOf('week')

      while (current.isBefore(end)) {
        const nextWeek = moment(current).add(1, 'week')
        data.push(
          this.assignments.filter(assignment =>
            moment(assignment.dueDate).isBetween(current, nextWeek)
          ).length
        )
        current.add(1, 'week')
      }

      return {
        label: '# of assignments due',
        data
      }
    }
  },
  async mounted () {
    await this.getAssessments()

    new Chart('bar-chart', {
      type: 'bar',
      data: {
        labels: [
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday'
        ], // ['Calculus II', 'RCOS', etc]
        datasets: [...this.assignmentsOverWeekPerCourseDatasets]
      },
      options: {
        title: {
          display: true,
          text: 'Assignments Over The Week'
        },
        scales: {
          xAxes: [
            {
              stacked: true
            }
          ],
          yAxes: [
            {
              stacked: true
            }
          ]
        }
      }
    })
  },
  methods: {
    addCategory () {
      const parts = this.newCategory.split('%')
      const weight = parseInt(parts[0])
      this.categories.push({
        title: parts[1],
        weight: weight,
        value: undefined
      })
      this.newCategory = ''
    },
    async getAssessments () {
      this.loading = true

      let request = await this.$http.get('/assignments')
      this.assignments = request.data.assignments

      request = await this.$http.get('/exams')
      this.exams = request.data.exams

      this.loading = false
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
