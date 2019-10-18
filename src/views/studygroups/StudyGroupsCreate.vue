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
            :hour-format="'12'"
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
            placeholder="Add a location that the study group will meet"
          />
        </div>
      </div>
      <div
        class="group-description"
      >
        <hr>
        <h1 class="subtitle study-group-heading">
          Add a description
        </h1>
        <b-input
          v-model="groupDescription"
          type="textarea"
          size="is-medium"
          placeholder="Add a title and description of this study group"
        />
      </div>
      <div
        class="group-sharing"
      >
        <hr>
        <h1 class="subtitle study-group-heading">
          Study Group Sharing
        </h1>
        <b-radio
          v-model="publicPrivate"
          native-value="public"
        >
          Public
        </b-radio>
        <b-radio
          v-model="publicPrivate"
          native-value="private"
          style="margin-left:25px"
        >
          Private
        </b-radio>
        <div
          v-if="publicPrivate === 'private'"
          class="add-members"
        >
          <div
            class="enter-members"
          >
            <b-input
              v-model="memberRCS"
              type="text"
              size="is-medium"
              style="width:25%; margin-top:15px; float:left"
              placeholder="Member RCS ID"
            />
            <b-button
              type="is-warning"
              style="float:left; margin-top:15px; margin-left:15px"
              @click="addMember"
            >
              Add to Study Group
            </b-button>
          </div>
          <div
            class="member-tags"
            style="clear:left; float:left; margin-top:15px"
          >
            <b-tag
              v-for="member in memberList"
              :key="member"
              size="is-large"
              closable
              style="margin-right:15px"
              @close="removeMember(member)"
            >
              {{ member }}
            </b-tag>
          </div>
        </div>
      </div>
      <div
        class="buttons-div"
        style="clear:left; float:left; margin-top:30px"
      >
        <b-button
          type="is-success"
        >
          Create Study Group
        </b-button>
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
      chosenTime: null,
      chosenLocation: '',
      groupDescription: '',
      publicPrivate: '',
      memberRCS: '',
      memberList: [],
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
    },
    addMember () {
      if (this.memberList.includes(this.memberRCS)) {
        alert('This person is already in the list!')
        return 0
      }
      this.memberList.push(this.memberRCS)
      this.memberRCS = ''
    },
    removeMember (member) {
      this.memberList.splice(this.memberList.indexOf(member), 1)
    }
  }
}
</script>
<style lang="scss" scoped>
.study-group-heading {
  margin-top: 1.5rem
}
</style>
