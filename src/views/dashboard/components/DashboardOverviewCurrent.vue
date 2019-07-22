<template>
  <div
    class="tile is-child notification is-dark dashboard-overview-current"
  >
    <p class="title">
      Right Now
    </p>

    <p
      v-if="currentStatus === 'busy'"
      class="subtitle"
    >
      You are busy with <b>{{ currentUnavailability.title }}</b> for the next
      <b>{{ duration(currentUnavailabilityDates.start, currentUnavailabilityDates.end) }} minutes</b>
      until {{ timeFormat(currentUnavailabilityDates.end) }}!
    </p>
    <template v-else-if="currentStatus === 'work-block'">
      <p class="subtitle">
        For the next <b>{{ duration(currentEvent.start, currentEvent.end) }} minutes</b> until <b>{{ timeFormat(currentEvent.end) }}</b>, you should be {{ currentEvent.assessment.assessmentType === 'assignment' ? 'working on' : 'studying for' }}
      </p>
      <div>
        <router-link
          class="has-text-centered is-size-2 assessment-link"
          :to="assessmentRoute(currentEvent.assessment)"
        >
          <CourseAssessmentDot
            :assessment="currentEvent.assessment"
            :course="course(currentEvent.assessment)"
          />
          {{ currentEvent.assessment.title }}
        </router-link>
        <p
          v-if="currentEvent.block.location"
          class="has-text-centered is-size-4 location"
        >
          @ {{ currentEvent.block.location }}
        </p>
        <progress
          class="progress is-small is-primary"
          :value="percentThrough"
          :title="percentThrough + '% through!'"
          max="100"
        >
          {{ percentThrough }}%
        </progress>
      </div>
    </template>
    <template v-else-if="currentStatus === 'period'">
      <p class="subtitle">
        For the next <b>{{ minutesLeft }} minutes</b> until <b>{{ timeFormat(currentEvent.end) }}</b>, you should be in
      </p>
      <div>
        <div class="has-text-centered is-size-3">
          <i
            class="fas fa-graduation-cap course-cap"
            :style="{ color: currentEvent.course.color }"
            @click="$store.commit('OPEN_COURSE_MODAL', currentEvent.course)"
          />
          {{ currentEvent.course.title }}
          <span class="has-text-grey">{{ periodType(currentEvent.period) }}</span>
          <p
            v-if="currentEvent.period.location"
            class="has-text-centered is-size-4 location"
          >
            @ {{ currentEvent.period.location }}
          </p>
        </div>

        <progress
          class="progress is-small is-primary"
          :value="percentThrough"
          :title="percentThrough + '% through!'"
          max="100"
        >
          {{ percentThrough }}%
        </progress>
      </div>
    </template>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'DashboardOverviewCurrent',
  computed: {
    currentStatus () {
      if (this.currentEvent) return this.currentEvent.eventType;
      if (this.currentUnavailability) return 'busy';
      return 'nothing';
    },
    currentUnavailability () {
      return this.$store.getters.currentUnavailability;
    },
    todaysAgenda () {
      return this.$store.getters.todaysAgenda;
    },
    currentEvent () {
      return this.todaysAgenda.find(this.isCurrentEvent);
    },
    percentThrough () {
      if (!this.currentEvent) return 0;
      const total = moment(this.currentEvent.end).diff(this.currentEvent.start, 'minutes');
      const minutesLeft = moment(this.currentEvent.end).diff(moment(), 'minutes');

      return Math.round((1 - minutesLeft / total) * 100);
    },
    currentUnavailabilityDates () {
      return {
        start: moment(this.currentUnavailability.startTime, 'HH:mm'),
        end: moment(this.currentUnavailability.endTime, 'HH:mm')
      };
    }
  },
  watch: {
    currentStatus (newCurrentStatus) {
      this.$emit('current-status', newCurrentStatus);
    }
  },
  mounted () {
    this.$emit('current-status', this.currentStatus);
  },
  methods: {
    duration (start, end) {
      return moment(end).diff(start, 'minutes');
    },
    isCurrentEvent (event) {
      return moment(this.rightNow).isBetween(event.start, event.end);
    },
    assessmentRoute (assessment) {
      return {
        name: `${assessment.assessmentType}-overview`,
        params: {
          [`${assessment.assessmentType}ID`]: assessment._id
        }
      };
    },
    course (a) {
      return this.$store.getters.getCourseFromCRN(a.courseCRN);
    },
    periodType (p) {
      return this.$store.getters.periodType(p.type);
    }
  }
};
</script>

<style lang="scss" scoped>

.location {
  font-style: italic;
}
.course-cap {
  cursor: pointer;
}

.progress {
  margin-top: 1.5rem;
}

.assessment-link {
  display: block;
  text-align: center;
  font-weight: bold;
  text-decoration: none !important;
}
</style>
