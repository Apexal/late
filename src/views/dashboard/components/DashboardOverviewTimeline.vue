<template>
  <div class="tile is-child box">
    <p class="title">
      Today's Timeline
    </p>
    <div
      v-if="todaysAgenda.length > 0"
      class="timeline"
    >
      <header class="timeline-header is-unselectable">
        <span class="tag is-medium is-primary">Morning</span>
      </header>
      <div
        v-for="(event, index) in todaysAgenda"
        :key="index"
        class="timeline-item"
        :class="timelineItemClass(event)"
      >
        <template v-if="event.eventType === 'assessment-block'">
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
            <template v-if="event.eventType === 'assessment-block'">
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
              <i class="has-text-grey">{{ event.period.location }}<a
                class="icon fa fa-map-marker-alt location-link"
                :href="'https://maps.google.com/?q=' + roomIntoLocation(event.period.location)"
                title="Open in Google Maps"
                target="_blank"
              /></i>
            </template>
          </p>
        </div>
      </div>

      <!--
      <header class="timeline-header">
        <span class="tag is-primary">End of Classes</span>
      </header>
      <div class="timeline-item">
        <div class="timeline-marker is-icon">
          <i class="fa fa-flag"/>
        </div>
        <div class="timeline-content">
          <p class="heading">
          March 2017
          </p>
          <p>Timeline content - Can include any HTML element</p>
        </div>
      </div> -->

      <div class="timeline-header is-unselectable">
        <span class="tag is-medium is-primary">Night</span>
      </div>
    </div>
    <p
      v-else
      class="has-text-grey"
    >
      No courses today and no working/studying scheduled for today!
    </p>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'DashboardOverviewTimeline',
  computed: {
    todaysAgenda () {
      return this.$store.getters.todaysAgenda
    }
  },
  methods: {
    roomIntoLocation (location) {
      return this.$store.getters.roomIntoLocation(location)
    },
    course (p) {
      return this.$store.getters.getCourseFromPeriod(p)
    },
    periodType (type) {
      return this.$store.getters.periodType(type)
    },
    eventDuration (event) {
      return moment(event.end).diff(event.start, 'minutes')
    },
    timelineRoute (event) {
      return {
        name: `${event.assessment.assessmentType}-overview`,
        params: {
          [`${event.assessment.assessmentType}ID`]: event.assessment._id
        }
      }
    },
    timelineItemClass (event) {
      let { start, end } = event
      if (typeof start === 'string') {
        start = moment(start, 'HH:mm', true)
        end = moment(end, 'HH:mm', true)
      }
      if (moment(end).isSameOrBefore(this.rightNow)) {
        return 'is-primary'
      } else if (moment(this.rightNow).isBetween(start, end)) {
        return 'is-warning'
      }
    },
    timelineItemTitle (event) {
      if (event.eventType === 'period') {
        return `${event.course.title} ${this.periodType(event.period.type)}`
      } else if (event.eventType === 'assessment-block') {
        return `${event.course.title} ${event.assessment.assessmentType}`
      }
    },
    markerIcon (event) {
      if (event.eventType === 'period') {
        return 'fa-graduation-cap'
      } else if (event.eventType === 'assessment-block') {
        return 'fa-clipboard-check'
      }

      return 'fa-question-circle'
    }
  }
}
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

i .location-link {
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.2s;
}

i:hover .location-link {
  opacity: 1;
}
</style>
