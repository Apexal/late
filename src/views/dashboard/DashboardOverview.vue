<!--Dashboard: Overview page-->
<template>
  <div class="dashboard-overview">
    <AssignmentsConfirm />
    <div class="box">
      <div class="tabs">
        <ul>
          <li class="is-active">
            <a>Today</a>
          </li>
          <li>
            <a>Tomorrow</a>
          </li>
        </ul>
      </div>
      <div
        v-if="todaysAgenda.length"
        class="columns"
      >
        <div class="column">
          <div class="timeline">
            <header class="timeline-header">
              <span class="tag is-medium is-primary">Morning</span>
            </header>
            <div
              v-for="(event, index) in todaysAgenda"
              :key="index"
              class="timeline-item"
              :class="timelineItemClass(event)"
            >
              <template v-if="event.eventType === 'work-block'">
                <router-link
                  tag="div"
                  class="timeline-marker is-icon"
                  :class="timelineItemClass(event)"
                  :title="timelineItemTitle(event)"
                  :to="timelineRoute(event)"
                >
                  <i
                    class="fas"
                    :class="markerIcon(event)"
                  />
                </router-link>
              </template>
              <template v-else-if="event.eventType === 'period'">
                <div
                  class="timeline-marker is-icon"
                  :class="timelineItemClass(event)"
                  :title="timelineItemTitle(event)"
                  @click="$store.commit('OPEN_COURSE_MODAL', event.course)"
                >
                  <i
                    class="fas"
                    :class="markerIcon(event)"
                  />
                </div>
              </template>

              <div class="timeline-content">
                <p class="heading">
                  {{ timeFormat(event.start) }} to {{ timeFormat(event.end) }}
                </p>
                <p>
                  <template v-if="event.eventType === 'work-block'">
                    {{
                      event.assessment.assessmentType === "assignment"
                        ? "Work on"
                        : "Study for"
                    }}
                    <router-link :to="timelineRoute(event)">
                      <b class="course-title">{{ event.assessment.title }}</b>
                    </router-link>
                    <br>
                    <i
                      v-if="event.block.location"
                      class="has-text-grey"
                    >
                      {{ event.block.location }}
                    </i>
                  </template>
                  <template v-else-if="event.eventType === 'period'">
                    <b class="course-title">{{ event.course.title }}</b>
                    <span class="has-text-grey">
                      {{ periodType(event.period.type) }}
                    </span>
                    <br>
                    <i class="has-text-grey">{{ event.period.location }}</i>
                  </template>
                </p>
              </div>
            </div>

            <!-- <header class="timeline-header">
            <span class="tag is-primary">End of Classes</span>
          </header>
          <div class="timeline-item">
            <div class="timeline-marker is-icon">
              <i class="fa fa-flag"></i>
            </div>
            <div class="timeline-content">
              <p class="heading">March 2017</p>
              <p>Timeline content - Can include any HTML element</p>
            </div>
            </div>-->
            <div class="timeline-header">
              <span class="tag is-medium is-primary">Night</span>
            </div>
          </div>
        </div>
        <div class="column">
          <img
            :src="imageURL"
            alt="Map of locations of today's periods"
          >
        </div>
      </div>
      <div v-else>
        <p class="has-text-centered has-text-grey">
          You have
          <b>nothing</b> on your agenda for today. No classes, working on
          assignments, or studying for exams scheduled!
        </p>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment';

import DashboardOverviewAssignmentsConfirm from './components/DashboardOverviewAssignmentsConfirm';

export default {
  name: 'DashboardOverview',
  components: { AssignmentsConfirm: DashboardOverviewAssignmentsConfirm },
  data () {
    return {
      zoom: 13,
      sizeX: 600,
      sizeY: 300
    };
  },
  computed: {
    todaysAgenda () {
      return this.$store.getters.todaysAgenda;
    },
    key () {
      return process.env.VUE_APP_GOOGLE_API_KEY;
    },
    periods () {
      return this.$store.state.schedule.periods;
    },
    imageURL () {
      let markers = this.periods.map(period => {
        const course = this.course(period);
        let color = '0x' + course.color.replace('#', '');
        let label = period.type.charAt(0);
        let locationParts = period.location.split(' ');
        let location =
          locationParts.slice(0, locationParts.length - 1).join(' ') +
          ', Troy, NY 12180';
        return `&markers=color:${color}|label:${label}|${location}`;
      });
      const url = `https://maps.googleapis.com/maps/api/staticmap?size=${
        this.sizeX
      }x${this.sizeY}&maptype=satellite${markers.join(
        ''
      )}&style=feature:all|visibility:off&style=feature:poi.school|visibility:on&key=${
        this.key
      }`;
      return encodeURI(url);
    }
  },
  methods: {
    course (p) {
      return this.$store.getters.getCourseFromPeriod(p);
    },
    eventDuration (event) {
      return moment(event.end).diff(event.start, 'minutes');
    },
    timelineRoute (event) {
      return {
        name: `${event.assessment.assessmentType}-overview`,
        params: {
          [`${event.assessment.assessmentType}ID`]: event.assessment._id
        }
      };
    },
    timelineItemClass (event) {
      if (moment(event.end).isSameOrBefore(this.now)) {
        return 'is-primary';
      } else if (moment(this.now).isBetween(event.start, event.end)) {
        return 'is-warning';
      }
    },
    timelineItemTitle (event) {
      if (event.eventType === 'period') {
        return `${event.course.title} ${this.periodType(event.period.type)}`;
      } else if (event.eventType === 'work-block') {
        return `${event.course.title} ${event.assessment.assessmentType}`;
      }
    },
    markerIcon (event) {
      if (event.eventType === 'period') {
        return 'fa-graduation-cap';
      } else if (event.eventType === 'work-block') {
        return 'fa-clipboard-check';
      }

      return 'fa-question-circle';
    },
    periodType (type) {
      return this.$store.getters.periodType(type);
    }
  }
};
</script>

<style lang="scss" scoped>
.timeline-marker {
  cursor: pointer;
}

.course-title {
  margin-right: 5px;
}

.timeline {
  padding-left: 20px;
}
</style>
