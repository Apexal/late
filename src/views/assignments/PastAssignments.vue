<template>
  <div class="past-assignments">
    <div class="columns">
      <div class="column is-narrow">
        <button
          class="button"
          :class="{ 'is-loading': loading }"
          @click="gotoPrevious"
        >Previous</button>
      </div>
      <div class="column">
        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label
              for="start"
              class="label"
            >Start</label>
          </div>
          <div class="field-body">
            <div class="control">
              <input
                id="start"
                v-model="startDate"
                class="input"
                type="date"
                min="2018-09-01"
                :max="endDate"
              >
            </div>
          </div>
        </div>
      </div>

      <div class="column">
        <div class="field is-horizontal">
          <div class="field-label is-normal">
            <label
              for="end"
              class="label"
            >End</label>
          </div>
          <div class="field-body">
            <div class="control">
              <input
                id="end"
                v-model="endDate"
                class="input"
                type="date"
                min="2018-09-01"
                :max="today"
              >
            </div>
          </div>
        </div>
      </div>

      <div class="column is-narrow">
        <button
          class="button"
          :class="{ 'is-loading': loading }"
          @click="gotoNext"
        >Next</button>
      </div>
    </div>

    <table class="table is-full-width">
      <thead>
        <tr>
          <th>Due</th>
          <th class="is-hidden-mobile">Course</th>
          <th>Assignment</th>
          <th>Completed</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="a in filtered"
          :key="a._id"
          :class="{ 'is-highlighted': isHighlighted(course(a)), 'is-completed': a.completed }"
          :style="{ color: isHighlighted(course(a)) ? 'white !important' : '', 'background-color': isHighlighted(course(a)) ? course(a).color : '' }"
        >
          <td :title="toFullDateTimeString(a.dueDate)">{{ toDateShorterString(a.dueDate) }}</td>
          <td class="is-hidden-mobile">
            <span
              class="dot"
              :title="course(a).longname"
              :style="'background-color: ' + course(a).color"
            />
            <b
              class="course-title"
            >{{ course(a).longname }}</b>
          </td>
          <td>
            <span
              class="dot is-hidden-tablet"
              :title="course(a).longname"
              :style="'background-color: ' + course(a).color"
            />
            <router-link
              class="assignment-link"
              :title="a.description.substring(0, 500)"
              :to="{name: 'assignment-overview', params: { assignmentID: a._id }}"
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
  name: 'PastAssignments',
  props: {
    highlighted: {
      type: Array,
      default: () => []
    },
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
      startDate: moment().subtract(7, 'days').format('YYYY-MM-DD'),
      endDate: moment().format('YYYY-MM-DD'),
      currentAssignments: []
    };
  },
  computed: {
    range () { return moment(this.endDate, 'YYYY-MM-DD', true).diff(moment(this.startDate, 'YYYY-MM-DD', true), 'days'); },
    today: () => moment().format('YYYY-MM-DD'),
    yesterday: () => moment().subtract(1, 'days').format('YYYY-MM-DD'),
    filtered () {
      return this.currentAssignments.filter(a => {
        if (!this.showCompleted && a.completed) return false;
        return !this.filter.includes(this.course(a).crn);
      });
    },
    pastAssignments () { return this.$store.getters.pastAssignments; }
  },
  watch: {
    startDate () { this.getAssignments(); },
    endDate () { this.getAssignments(); }
  },
  created () {
    this.getAssignments();
  },
  methods: {
    gotoPrevious () {
      const range = this.range;
      this.startDate = moment(this.startDate, 'YYYY-MM-DD', true).subtract(range, 'days').format('YYYY-MM-DD');
      this.endDate = moment(this.endDate, 'YYYY-MM-DD', true).subtract(range, 'days').format('YYYY-MM-DD');
    },
    gotoNext () {
      const range = this.range;
      this.startDate = moment(this.startDate, 'YYYY-MM-DD', true).add(range, 'days').format('YYYY-MM-DD');
      this.endDate = moment(this.endDate, 'YYYY-MM-DD', true).add(range, 'days').format('YYYY-MM-DD');
    },
    async getAssignments () {
      this.loading = true;
      const request = await this.$http.get('/assignments/list',
        { params: { start: this.startDate, end: this.endDate } }
      );

      this.currentAssignments = request.data.assignments;
      this.loading = false;
    },
    course (a) {
      return this.$store.getters.getCourseFromCRN(a.courseCRN);
    },
    isHighlighted (c) { return this.highlighted.includes(c.crn); },
    toFullDateTimeString: dueDate => moment(dueDate).format('dddd, MMMM Do YYYY, h:mma'),
    toDateShorterString (dueDate) { return moment(dueDate).format('MM/DD/YY'); }
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
