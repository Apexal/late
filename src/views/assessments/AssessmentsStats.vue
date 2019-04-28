<template>
  <section class="section assessment-stats">
    <h1 class="has-text-centered-mobile title">
      Coursework Stats
    </h1>
    <p
      v-if="loading"
      class="has-text-grey has-text-centered"
    >
      Grabbing your stats...
    </p>
    <div
      v-else
      class="charts"
    >
      <canvas id="doughnut-chart" />

      <canvas id="bar-chart" />

      <canvas id="line-chart" />
    </div>
  </section>
</template>

<script>
import moment from 'moment';
import Chart from 'chart.js';

export default {
  name: 'AssessmentsStats',
  data () {
    return {
      loading: true,
      assignments: [],
      exams: []
    };
  },
  computed: {
    courses () {
      return this.$store.getters.current_schedule;
    },
    assignmentCountDataset () {
      const data = this.courses.map(
        course =>
          this.assignments.filter(
            assignment => assignment.courseCRN === course.crn
          ).length
      );

      return {
        label: '# of assignments and exams',
        data,
        backgroundColor: this.courses.map(course => course.color),
        borderColor: 'white', // this.courses.map(course => course.color),
        borderWidth: 1
      };
    },
    scheduledTimeDataSet () {
      const data = this.courses.map(course =>
        this.assignments
          .filter(assignment => assignment.courseCRN === course.crn)
          .map(assignment => assignment.scheduledTime)
          .reduce((acc, duration) => acc + duration, 0)
      );

      return {
        label: 'minutes',
        data,
        backgroundColor: this.courses.map(course => course.color),
        borderColor: 'white', // this.courses.map(course => course.color),
        borderWidth: 1
      };
    },
    assignmentsOverWeekDataset () {
      const data = [0, 0, 0, 0, 0, 0, 0]; // [ # of assignments due Sunday, # of assignments due Monday, ... ]
      for (let assignment of this.assignments) {
        const day = moment(assignment.dueDate).day();
        data[day] += 1;
      }

      return {
        label: '# of assignments',
        data,
        backgroundColor: 'grey',
        borderColor: 'white', // this.courses.map(course => course.color),
        borderWidth: 1,
        group: 'total'
      };
    },
    assignmentsOverWeekPerCourseDatasets () {
      const datasets = [];

      for (let course of this.courses) {
        const assignments = this.assignments.filter(
          assignment => assignment.courseCRN === course.crn
        );

        const data = [0, 0, 0, 0, 0, 0, 0]; // [ # of assignments due Sunday, # of assignments due Monday, ... ]
        for (let assignment of assignments) {
          const day = moment(assignment.dueDate).day();
          data[day] += 1;
        }

        datasets.push({
          label: course.longname,
          data,
          backgroundColor: course.color,
          borderColor: 'white', // this.courses.map(course => course.color),
          borderWidth: 1,
          group: 'total'
        });
      }

      return datasets;
    },
    currentTerm () {
      return this.$store.getters.currentTerm;
    },
    weekLabels () {
      const weekLabels = [];

      const end = moment(this.currentTerm.end).endOf('week');
      const current = moment(this.currentTerm.start).startOf('week');

      while (current.isBefore(end)) {
        weekLabels.push(current.format('[Week of] MMMM Do'));
        current.add(1, 'week');
      }

      return weekLabels;
    },
    assignmentsDueOverTermDataset () {
      const data = [];

      const end = moment(this.currentTerm.end).endOf('week');
      const current = moment(this.currentTerm.start).startOf('week');

      while (current.isBefore(end)) {
        const nextWeek = moment(current).add(1, 'week');
        data.push(
          this.assignments.filter(assignment =>
            moment(assignment.dueDate).isBetween(current, nextWeek)
          ).length
        );
        current.add(1, 'week');
      }

      return {
        label: '# of assignments due',
        data
      };
    }
  },
  async mounted () {
    await this.getAssessments();

    const workTimeData = this.courses.map(course =>
      this.assignments
        .filter(assignment => assignment.courseCRN === course.crn)
        .map(assignment => assignment.scheduledTime)
        .reduce((acc, duration) => acc + duration, 0)
    );

    const doughnutChart = new Chart('doughnut-chart', {
      type: 'doughnut',
      data: {
        labels: this.courses.map(course => course.longname), // ['Calculus II', 'RCOS', etc]
        datasets: [this.assignmentCountDataset, this.scheduledTimeDataSet]
      },
      options: {
        title: {
          display: true,
          text: 'Assignments vs Course'
        }
      }
    });

    const barChart = new Chart('bar-chart', {
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
    });

    const lineChart = new Chart('line-chart', {
      type: 'line',
      data: {
        labels: this.weekLabels, // ['Calculus II', 'RCOS', etc]
        datasets: [this.assignmentsDueOverTermDataset]
      },
      options: {
        title: {
          display: true,
          text: 'Assignments vs Course'
        }
      }
    });
  },
  methods: {
    async getAssessments () {
      this.loading = true;

      let request = await this.$http.get('/assignments');
      this.assignments = request.data.assignments;

      request = await this.$http.get('/exams');
      this.exams = request.data.exams;

      this.loading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.charts canvas {
  margin-bottom: 50px;
}
</style>
