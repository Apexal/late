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
          style="top:4px"
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
    </div>
    <div
      class="group-title"
    >
      <hr>
      <h1 class="subtitle study-group-heading">
        Add a title
      </h1>
      <div
        style="width:50%"
      >
        <b-input
          v-model="groupTitle"
          type="text"
          size="is-medium"
          placeholder="Add a title for this study group"
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
      <div
        style="width:50%"
      >
        <b-input
          v-model="groupDescription"
          type="textarea"
          size="is-medium"
          placeholder="Add a description of this study group"
        />
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
      class="group-location"
    >
      <hr>
      <h1 class="subtitle study-group-heading">
        Add a location
      </h1>
      <div
        style="width:50%"
      >
        <b-input
          v-model="groupLocation"
          type="text"
          size="is-medium"
          placeholder="Add a location for this study group"
        />
      </div>
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
          <b-field
            style="margin-top:15px"
          >
            <b-input
              v-model="memberRCS"
              type="text"
              placeholder="Member RCS ID"
              size="is-medium"
              @keyup.native.enter="addMember"
            />
            <p class="control">
              <b-button
                type="is-warning"
                size="is-medium"
                @click="addMember"
              >
                Add to Study Group
              </b-button>
            </p>
          </b-field>
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
        @click="createStudyGroup()"
      >
        Create Study Group
      </b-button>
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
      groupLocation: '',
      groupTitle: '',
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
      if (this.memberRCS === '') {
        return 0
      }
      this.memberList.push(this.memberRCS)
      this.memberRCS = ''
    },
    removeMember (member) {
      this.memberList.splice(this.memberList.indexOf(member), 1)
    },
    async createStudyGroup () {
      if (!this.allFieldsCompleted()) {
        return this.showError('Make sure you fill out all the fields!')
      }

      let request
      try {
        request = await this.$http.post('/studygroups', {
          course: this.chosenCourse,
          date: this.getFormattedDate(),
          time: this.getFormattedTime(),
          location: this.groupLocation,
          title: this.groupTitle,
          description: this.groupDescription,
          publicPrivate: this.publicPrivate,
          members: this.publicPrivate === 'public' ? [] : this.memberList
        })
        this.$buefy.toast.open({
          message: 'Successfully created this group',
          type: 'is-success'
        })
      } catch (e) {
        this.showError('There was an error creating this group.')
      }
    },
    allFieldsCompleted () {
      if (this.chosenCourse === '') return false
      else if (this.chosenDate === '') return false
      else if (this.chosenTime === null) return false
      else if (this.groupLocation === '') return false
      else if (this.groupTitle === '') return false
      else if (this.groupDescription === '') return false
      else if (this.publicPrivate === '') return false
      return true
    },
    getFormattedTime () {
      let formattedTime = ''
      let amOrPm = 'AM'
      if (moment(this.chosenTime).hour() > 12) {
        formattedTime += (moment(this.chosenTime).hour() - 12)
        amOrPm = 'PM'
      } else formattedTime += moment(this.chosenTime).hour()
      formattedTime += ':'
      if (String(moment(this.chosenTime).minute().length < 2)) formattedTime += '0'
      formattedTime += moment(this.chosenTime).minute()
      formattedTime += ' ' + amOrPm
      return formattedTime
    },
    getFormattedDate () {
      let formattedDate = ''
      formattedDate += (moment(this.chosenDate).month() + 1)
      formattedDate += '/'
      formattedDate += moment(this.chosenDate).date()
      formattedDate += '/'
      formattedDate += moment(this.chosenDate).year()
      return formattedDate
    }
  }
}
</script>
<style lang="scss" scoped>
.study-group-heading {
  margin-top: 1.5rem
}
</style>
