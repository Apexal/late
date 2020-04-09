<!--Dashboard: Main calendar view-->
<template>
  <div id="calendar-holder">
    <DashboardCalendarSelectModal
      :open="selectModal.open"
      :start="selectModal.start"
      :end="selectModal.end"
      :assessments="filteredUpcomingAssessments"
      @add-assessment-block="addBlock('assessment', arguments[0])"
      @add-course-block="addBlock('course', arguments[0])"
      @add-todo-block="addBlock('todo', arguments[0])"
      @close-modal="selectModal.open = false"
    />
    <DashboardCalendarEventModal
      :open="eventModal.open"
      :event="eventModal.event"
      @close-modal="eventModal.open = false"
    />
    <FullCalendar
      ref="dashboard-calendar"
      :plugins="calendar.plugins"
      :events="events"
      :editable="true"
      :selectable="true"
      :header="calendar.header"
      :views="calendar.views"
      :valid-range="calendar.validRange"
      :business-hours="calendar.businessHours"
      :day-count="5"
      :default-view="calendar.defaultView"
      height="parent"
      time-format="h(:mm)t"
      snap-duration="00:15"
      :now-indicator="true"
      :event-overlap="true"
      :select-overlap="true"

      :scroll-time="calendar.scrollTime"
      no-events-message="You've got nothing to do!"
      time-zone="local"
      all-day-text="Due"
      :button-text="calendar.buttonText"
      :event-render="eventRender"
      :dates-render="datesRender"
      :droppable="true"
      @eventClick="eventClick"
      @eventDrop="eventDrop"
      @eventReceive="eventReceive"
      @eventResize="eventResize"
      @select="select"
    />
    <b-button
      id="fullscreen-toggle"
      class="enter-fullscreen"
      title="Toggle Fullscreen"
      @click="toggleFullscreen"
    >
      <i class="fas fa-expand-arrows-alt" />
      <i class="fas fa-compress-arrows-alt" />
    </b-button>
  </div>
</template>

<script>
import moment from 'moment'

import fullcalendar from '@/mixins/fullcalendar'

import FullCalendar from '@fullcalendar/vue'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

import '@fullcalendar/core/main.css'
import '@fullcalendar/daygrid/main.css'
import '@fullcalendar/timegrid/main.css'

import DashboardCalendarSelectModal from '@/views/dashboard/components/DashboardCalendarSelectModal'
import DashboardCalendarEventModal from '@/views/dashboard/components/DashboardCalendarEventModal'

const viewNames = ['timeGridThreeDay', 'timeGridFiveDay', 'timeGridWeek']

export default {
  name: 'DashboardCalendar',
  components: {
    DashboardCalendarSelectModal,
    DashboardCalendarEventModal,
    FullCalendar
  },
  mixins: [fullcalendar],
  data () {
    return {
      selectModal: {
        open: false,
        start: moment(),
        end: moment()
      },
      eventModal: {
        open: false,
        event: {}
      },
      academicCalendarEvents: [],
      calendar: {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        header: {
          center: 'timeGridThreeDay,timeGridFiveDay,timeGridWeek',
          right: 'today,prev,next'
        },
        scrollTime: '08:00',
        views: {
          timeGridThreeDay: {
            type: 'timeGrid',
            duration: { days: 3 },
            buttonText: '3-Day'
          },
          timeGridFiveDay: {
            type: 'timeGrid',
            duration: { days: 5 },
            buttonText: '5-Day'
          }
        },
        validRange: {
          start: this.$store.getters.currentTerm.startDate,
          end: this.$store.getters.currentTerm.endDate
        },
        businessHours: {
          daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
          startTime: this.$store.state.auth.user.earliestWorkTime,
          endTime: this.$store.state.auth.user.latestWorkTime
        },
        defaultView: viewNames.includes(localStorage.getItem('dashboardCalendarDefaultView')) ? localStorage.getItem('dashboardCalendarDefaultView') : 'timeGridWeek',
        buttonText: {
          today: 'Today',
          timeGridWeek: 'Week'
        }
      }
    }
  },
  computed: {
    isFullscreen () {
      return document.fullscreenElement !== null
    },
    filteredUpcomingAssessments () {
      return this.$store.state.assessments.upcomingAssessments.filter(
        assessment =>
          moment(this.selectModal.end).isSameOrBefore( // fix
            assessment.dueDate || assessment.date
          ) &&
          (assessment.assessmentType === 'exam' ||
          (assessment.assessmentType === 'assignment' &&
          !assessment.completed))
      )
    },
    events () {
      const courseSchedule = this.$store.getters.getCourseScheduleAsEvents

      const unavailabilitySchedule = this.$store.getters
        .getUnavailabilityAsEvents

      const upcomingAssessments = this.$store.getters.getUpcomingAssessmentsAsEvents.filter(
        event => {
          if (event.eventType === 'assignment') {
            return !event.assignment.completed
          }
          return true
        }
      )

      const assessmentBlocks = this.$store.getters.getAssessmentBlocksAsEvents
      const courseBlocks = this.$store.getters.getCourseBlocksAsEvents
      const todoBlocks = this.$store.getters.getTodoBlocksAsEvents

      return courseSchedule
        .concat(upcomingAssessments)
        .concat(unavailabilitySchedule)
        .concat(assessmentBlocks)
        .concat(courseBlocks)
        .concat(todoBlocks)
        // .concat(this.academicCalendarEvents)
    },
    earliest () {
      const earliest = this.$store.state.auth.user.earliestWorkTime
      // const courses = this.$store.getters.getCourseScheduleAsEvents;
      // const assessmentBlocks = this.$store.getters.getAssessmentBlocksAsEvents.map(e =>
      //   Object.assign({}, e)
      // );

      // let i;
      // for (i = 0; i < courses.length; i++) {
      //   if (courses[i].start.localeCompare(earliest) < 0) {
      //     earliest = courses[i].start;
      //   }
      // }
      // for (i = 0; i < assessmentBlocks.length; i++) {
      //   if (assessmentBlocks[i].start.localeCompare(earliest) < 0) {
      //     earliest = assessmentBlocks[i].start;
      //   }
      // }

      return earliest
    }
  },
  watch: {
    // earliest (newEarliest) {
    //   this.calendar.config.scrollTime = this.earliest;
    //   this.$refs['dashboard-calendar'].fireMethod(
    //     'option',
    //     'scrollTime',
    //     this.calendar.config.scrollTime
    //   );
    // }
  },
  async created () {
    this.calendar.scrollTime = this.earliest

    const response = await this.$http.get('/integrations/academiccalendar')
    const parsed = response.data.events
    const events = []
    for (const id in parsed) {
      if (parsed[id].summary) {
        events.push(this.mapICalObjectToEvent(id, parsed[id]))
      }
    }
    this.academicCalendarEvents = events
  },
  mounted () {
    if (
      typeof window.orientation !== 'undefined' ||
      navigator.userAgent.indexOf('IEMobile') !== -1
    ) {
      // Only show three day view on mobile
      const calendarApi = this.$refs['dashboard-calendar'].getApi()
      calendarApi.changeView('timeGridThreeDay')
    }
  },
  methods: {
    datesRender ({ view, el }) {
      if (view.name !== localStorage.getItem('dashboardCalendarDefaultView')) { localStorage.setItem('dashboardCalendarDefaultView', view.type) }
    },
    mapICalObjectToEvent (id, obj) {
      const event = {
        id,
        title: obj.summary,
        eventType: 'academic-calendar-event',
        start: obj.start,
        editable: false,
        eventURL: `http://events.rpi.edu/cal/event/eventView.do?b=de&calPath=%2Fpublic%2Fcals%2FMainCal&guid=${id}`
      }
      if (obj.end) event.end = obj.end
      else event.allDay = true

      return event
    },
    toggleFullscreen () {
      if (document.fullscreenElement) {
        document.exitFullscreen()
        document.getElementById('fullscreen-toggle').classList.remove('exit-fullscreen')
        document.getElementById('fullscreen-toggle').classList.add('enter-fullscreen')
      } else {
        const div = document.getElementById('calendar-holder')
        div.requestFullscreen()
        document.getElementById('fullscreen-toggle').classList.remove('enter-fullscreen')
        document.getElementById('fullscreen-toggle').classList.add('exit-fullscreen')
      }
    },
    select ({ start, end }) {
      this.selectModal.start = moment(start)
      this.selectModal.end = moment(end)
      this.selectModal.open = true
    },
    async addBlock (blockType, item) {
      if (!item || !this.selectModal.open) return

      await this.$store.dispatch('ADD_' + blockType.toUpperCase() + '_BLOCK', {
        [blockType]: item,
        start: this.selectModal.start,
        end: this.selectModal.end
      })

      this.$buefy.toast.open({
        message: `Added ${blockType} block to your schedule!`,
        type: 'is-primary',
        duration: 1000
      })

      this.selectModal.open = false

      const calendarApi = this.$refs['dashboard-calendar'].getApi()
      calendarApi.unselect()
    },
    eventClick ({ event, jsEvent, view }) {
      const { eventType, assessment } = event.extendedProps

      if (eventType === 'course') {
        this.$store.commit('SET_ADD_ASSIGNMENT_MODAL_VALUES', {
          modalStep: 2,
          dueDate: moment(event.start),
          dueTime: moment(event.start).format('HH:mm')
        })
        this.$store.commit('SET_ADD_EXAM_MODAL_VALUES', {
          modalStep: 2,
          date: event.start,
          time: moment(event.start).format('HH:mm')
        })
        this.$store.commit('OPEN_COURSE_MODAL', event.extendedProps.course)
      } else if (eventType === 'course-block') {
        this.$store.commit('OPEN_COURSE_MODAL', event.extendedProps.course)
      } else if (eventType === 'todo-block') {
        // TODO: something
      } else if (eventType === 'assignment') {
        this.$router.push({
          name: 'assignment-overview',
          params: { assignmentID: assessment._id }
        })
      } else if (eventType === 'exam') {
        this.$router.push({
          name: 'exam-overview',
          params: { examID: assessment._id }
        })
      } else if (eventType === 'assessment-block') {
        const { assessmentType } = assessment

        if (assessmentType === 'assignment') {
          this.$router.push({
            name: 'assignment-overview',
            params: { assignmentID: assessment._id }
          })
        } else if (assessmentType === 'exam') {
          this.$router.push({
            name: 'exam-overview',
            params: { examID: assessment._id }
          })
        }
      } else if (eventType === 'academic-calendar-event') {
        this.eventModal.event = event
        this.eventModal.open = true
      } else if (eventType === 'unavailability') {
        this.$router.push({ name: 'setup-unavailability' })
      }
    },
    async eventReceive ({ event }) {
      const { assessmentID } = event.extendedProps
      const assessment = this.$store.getters.getUpcomingAssessmentById(assessmentID)
      try {
        await this.$store.dispatch('ADD_ASSESSMENT_BLOCK', { assessment, start: event.start, end: event.end })
      } catch (e) {
        event.remove()
        return this.showError('There was an error scheduling that work block...')
      }

      event.remove()
      this.$buefy.toast.open({
        message: 'Added work block to your schedule!',
        type: 'is-primary',
        duration: 1000
      })
    },
    eventDrop ({ event, revert }) {
      const { eventType, assessment, course, todo, blockID } = event.extendedProps
      if (eventType === 'assessment-block') {
        // Update work block on server
        if (moment(event.end).isBefore(moment())) {
          this.$buefy.dialog.confirm({
            message: 'Move this past work block?',
            onConfirm: () =>
              this.editBlock(
                'assessment',
                blockID,
                assessment,
                event.start,
                event.end
              ),
            onCancel: revert
          })
        } else {
          this.editBlock(
            'assessment',
            blockID,
            assessment,
            event.start,
            event.end
          )
        }
      } else if (eventType === 'course-block') {
        this.editBlock(
          'course',
          blockID,
          course,
          event.start,
          event.end
        )
      } else if (eventType === 'todo-block') {
        this.editBlock(
          'todo',
          blockID,
          todo,
          event.start,
          event.end
        )
      }
    },
    eventResize ({ event, revert }) {
      const { eventType, assessment, course, todo, blockID } = event.extendedProps
      if (eventType === 'assessment-block') {
        if (moment(event.end).isBefore(moment())) {
          this.$buefy.dialog.confirm({
            message: 'Edit this past work block?',
            onConfirm: () =>
              this.editBlock(
                'assessment',
                blockID,
                assessment,
                event.start,
                event.end
              ),
            onCancel: revert
          })
        } else {
          this.editBlock(
            'assessment',
            blockID,
            assessment,
            event.start,
            event.end
          )
        }
      } else if (eventType === 'course-block') {
        this.editBlock(
          'course',
          blockID,
          course,
          event.start,
          event.end
        )
      } else if (eventType === 'todo-block') {
        this.editBlock(
          'todo',
          blockID,
          todo,
          event.start,
          event.end
        )
      }
    },
    async editBlock (blockType, blockID, item, start, end) {
      await this.$store.dispatch('EDIT_' + blockType.toUpperCase() + '_BLOCK', {
        [blockType]: item,
        blockID,
        start,
        end
      })

      this.$buefy.toast.open({
        message: `Rescheduled ${blockType} block!`,
        type: 'is-primary',
        duration: 1000
      })
    }
  }
}
</script>

<style lang='scss'>
.tabs .title {
  margin: 0;
}

.dashboard-calendar-select-modal .panel {
  .assessment-type-tag {
    text-transform: capitalize;
    color: white;
  }
  b {
    font-weight: 500;
  }
  .panel-block {
    background-color: white;
    cursor: pointer;
  }
}

#calendar-holder {
  height: 800px;
  .show-fullscreen {
    display: none;
  }
  &:fullscreen {
    padding: 15px;
    background-color: white;
    height: 95%;
    .show-fullscreen {
      display: initial;
    }
    .hide-fullscreen {
      display: none;
    }
  }
}
#fullscreen-toggle {
  float: right;
  z-index: 10;
}
.enter-fullscreen {
  transition: 0.2s;
  margin-top: -35px;
  .fa-compress-arrows-alt { display: none; }
}
.exit-fullscreen {
  transition: 0.2s;
  margin-top: -35px;
  .fa-expand-arrows-alt { display: none; }
}

.fc-time-grid-container {
  max-height: 80vh!important;
}
</style>
