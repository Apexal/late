<template>
  <section class="section assessment-stats">
    <h1 class="has-text-centered-mobile title">
      Coursework Stats
    </h1>
    <p class="has-text-grey has-text-centered">
      Coming soon...
    </p>

    <canvas id="chart" />
  </section>
</template>

<script>
import Chart from 'chart.js';

export default {
  name: 'AssessmentsStats',
  computed: {
    courses () {
      return this.$store.getters.current_schedule;
    }
  },
  async mounted () {
    let request = await this.$http.get('/assignments');
    const assignments = request.data.assignments;
    /*
      [
        {
          longname: 'Calculus II',
          color: 'red'
        },
        {
          longname: 'Physics II',
          color: 'blue'
        }
      ]
    */

    // for assignment in assignments:
    // dictionary[course] = assignment

    const myChart = new Chart('chart', {
      type: 'doughnut',
      data: {
        labels: this.courses.map(course => course.longname), // ['Calculus II', 'RCOS', etc]
        datasets: [{
          label: '# of assignments and exams',
          data: this.courses.map(course => assignments.filter(assignment => assignment.courseCRN === course.crn).length),
          backgroundColor: this.courses.map(course => course.color),
          borderColor: 'white', // this.courses.map(course => course.color),
          borderWidth: 1
        }]
      },
      options: {
        /*
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
        */
      }
    });
  }
};
</script>

<style lang="scss" scoped>
#chart {
  width: 50%
}
</style>
