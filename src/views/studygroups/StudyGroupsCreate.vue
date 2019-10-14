<template>
  <div class="study-groups-create">
    <div class="class-selection">
      <h1 class="subtitle study-group-heading">
        Select a class
      </h1>
      <div
        v-for="course in courses"
        :key="course.crn"
        class="course box"
      >
        <b-checkbox
          v-model="chosenCourse"
          :true-value="course"
          false-value=""
        />
        <span class="has-text-grey">
          {{ course.summary }}
        </span>
        <span>
          {{ course.title }}
        </span>
        <div class="tags is-pulled-right">
          <span class="tag is-rounded">
            Section {{ course.sectionId }}
          </span>
        </div>
      </div>
      <div
        class="date-selection"
      >
        <hr>
        <h1 class="subtitle study-group-heading">
          Select a date
        </h1>
        <FullCalendar
          ref="calendar"
          :plugins="calendar.plugins"
          :editable="false"
          :selectable="false"
          :header="calendar.header"
          :height="500"
          default-view="dayGridMonth"
          time-format="h(:mm)t"
          time-zone="local"
          :valid-range="calendar.validRange"
          :events="chosenDateEvent"
          @dateClick="dateClick"
        />
      </div>
      <div
        class="time-selection"
      >
        <hr>
        <h1 class="subtitle study-group-heading">
          Select a time
        </h1>
        <div
          style="width:25%"
        >
          <b-timepicker
            v-model="chosenTime"
            rounded
            placeholder="Select a time"
            icon="clock"
            :hour-format="true"
          />
        </div>
      </div>
      <div
        class="location-selection"
      >
        <hr>
        <h1 class="subtitle study-group-heading">
          Select a location
        </h1>
        <div
          style="width:50%"
        >
          <b-input
            v-model="chosenLocation"
            type="text"
            size="is-medium"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import moment from 'moment'

import FullCalendar from '@fullcalendar/vue'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'

import '@fullcalendar/core/main.css'
import '@fullcalendar/daygrid/main.css'
import '@fullcalendar/timegrid/main.css'

export default {
  name: 'StudyGroupsCreate',
  components: {
    FullCalendar
  },
  data () {
    return {
      chosenCourse: '',
      chosenDate: '',
      chosenDateEvent: [],
      chosenTime: '',
      chosenLocation: '',
      calendar: {
        plugins: [dayGridPlugin, interactionPlugin],
        header: {
          left: 'title',
          center: '',
          right: 'today prev,next'
        },
        validRange: {
          start: moment().format(),
          end: this.$store.getters.currentTerm.end
        }
      }
    }
  },
  methods: {
    dateClick ({ date }) {
      if (moment(this.chosenDate).isSame(date)) {
        this.chosenDate = ''
        this.chosenDateEvent = []
      } else {
        this.chosenDate = date
        this.chosenDateEvent = [{
          id: 'chosenDate',
          title: 'Study Group',
          start: date,
          allDay: true
        }]
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.study-group-heading {
  margin-top: 1.5rem
}
</style>
