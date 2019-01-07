<template>
  <div class="past-assignments">
    <h2 class="subtitle">
      Week of {{ weekOf }}
    </h2>
    <div class="columns">
      <div class="column is-narrow">
        <button
          class="button"
          :class="{ 'is-loading': loading }"
          @click="shiftDates(-7)"
        >
          <span class="icon">
            <i class="fas fa-chevron-left" />
          </span>
        </button>
      </div>
      <div class="column is-narrow">
        <div class="field is-horizontal">
          <div class="field-body">
            <div class="control">
              <input
                id="start"
                :value="startDate"
                class="input"
                type="date"
                min="2018-09-01"
                :max="endDate"
                disabled
              >
            </div>
          </div>
        </div>
      </div>
      <div class="column">
        <div class="buttons is-centered">
          <button
            class="button is-primary"
            :disabled="isLastWeek"
            @click="gotoLastWeek"
          >
            Last Week
          </button>
        </div>
      </div>
      <div class="column is-narrow">
        <div class="field is-horizontal">
          <div class="field-body">
            <div class="control">
              <input
                id="end"
                :value="endDate"
                class="input"
                type="date"
                min="2018-09-01"
                :max="today"
                disabled
              >
            </div>
          </div>
        </div>
      </div>

      <div class="column is-narrow">
        <button
          class="button"
          :class="{ 'is-loading': loading }"
          :disabled="!canGoForward"
          @click="shiftDates(7)"
        >
          <span class="icon">
            <i class="fas fa-chevron-right" />
          </span>
        </button>
      </div>
    </div>

    <table class="table is-full-width">
      <thead>
        <tr>
          <th>Due</th>
          <th class="is-hidden-mobile">
            Course
          </th>
          <th>Assignment</th>
          <th>Completed</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="a in filtered"
          :key="a._id"
        >
          <td :title="toFullDateTimeString(a.dueDate)">
            {{ toDateShorterString(a.dueDate) }}
            <span
              class="has-text-grey"
            >
              {{ toTimeString(a.dueDate) }}
            </span>
          </td>
          <td
            class="is-hidden-mobile"
            @click="$store.commit('OPEN_COURSE_MODAL', course(a))"
          >
            <span
              class="dot"
              :title="course(a).longname"
              :style="'background-color: ' + course(a).color"
            />
            <b class="course-title">
              {{ course(a).longname }}
            </b>
          </td>
          <td>
            <span
              class="dot is-hidden-tablet"
              :title="course(a).longname"
              :style="'background-color: ' + course(a).color"
              @click="$store.commit('OPEN_COURSE_MODAL', course(a))"
            />
            <router-link
              class="assignment-link"
              :title="a.description.substring(0, 500)"
              :to="{name: 'assignments-overview', params: { assignmentID: a._id }}"
            >
              {{ a.title }}
            </router-link>
          </td>
          <td>
            <span class="icon">
              <i
                class="fas"
                :class="{ 'fa-check': a.completed, 'fa-times': !a.completed }"
              />
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'AssignmentsPastList',
  props: {
    showCompleted: {
      type: Boolean,
      default: true
    },
    filter: {
      type: Array,
      default: () => []
    }
  },
  data () {
    return {
      loading: true,
      startDate:
        this.$route.query.start ||
        moment()
          .subtract(7, 'days')
          .format('YYYY-MM-DD'),
      endDate: this.$route.query.end || moment().format('YYYY-MM-DD'),
      currentAssignments: []
    };
  },
  computed: {
    canGoForward () {
      return this.endMoment.isBefore(moment().startOf('day'));
    },
    startMoment () {
      return moment(this.startDate, 'YYYY-MM-DD', true);
    },
    endMoment () {
      return moment(this.endDate, 'YYYY-MM-DD', true);
    },
    isLastWeek () {
      return this.endMoment.isSame(moment(), 'day');
    },
    weekOf () {
      return this.startMoment.format('dddd, MMMM Do YYYY');
    },
    range () {
      return this.endMoment.diff(
        moment(this.startDate, 'YYYY-MM-DD', true),
        'days'
      );
    },
    today: () => moment().format('YYYY-MM-DD'),
    yesterday: () =>
      moment()
        .subtract(1, 'days')
        .format('YYYY-MM-DD'),
    filtered () {
      return this.currentAssignments.filter(a => {
        if (!this.showCompleted && a.completed) return false;
        return !this.filter.includes(this.course(a).crn);
      });
    }
  },
  created () {
    this.getAssignments();
  },
  methods: {
    gotoLastWeek () {
      this.endDate = this.today;
      this.startDate = moment()
        .subtract('1', 'week')
        .format('YYYY-MM-DD');

      this.getAssignments();
    },
    shiftDates (amount) {
      this.startDate = moment(this.startDate, 'YYYY-MM-DD', true)
        .add(amount, 'days')
        .format('YYYY-MM-DD');
      this.endDate = moment(this.endDate, 'YYYY-MM-DD', true)
        .add(amount, 'days')
        .format('YYYY-MM-DD');

      this.getAssignments();
    },
    async getAssignments () {
      this.loading = true;
      let request;

      try {
        request = await this.$http.get('/assignments', {
          params: { start: this.startDate, end: this.endDate }
        });
      } catch (e) {
        this.loading = false;
        this.currentAssignments = [];
        return this.$toasted.error(e.response.data.message);
      }

      this.currentAssignments = request.data.assignments;
      this.loading = false;
    },
    course (a) {
      return this.$store.getters.getCourseFromCRN(a.courseCRN);
    },
    toFullDateTimeString: dueDate =>
      moment(dueDate).format('dddd, MMMM Do YYYY, h:mma'),
    toDateShorterString: dueDate => moment(dueDate).format('MM/DD/YY'),
    toTimeString: time => moment(time).format('h:mm a')
  }
};
</script>

<style lang="scss" scoped>
.dot {
  margin-right: 5px;
}

.assignment-link {
  color: inherit;
}

.fas {
  &.fa-check {
    color: green;
  }

  &.fa-times {
    color: red;
  }
}
</style>
