<!--Assessments: assessment overview work schedule module-->
<template>
  <div
    id="assessment-work-schedule"
    class="assessment-work-schedule"
  >
    <div class="columns">
      <div class="column">
        <b-progress
          :value="scheduledMinutes"
          :max="totalEstimatedMinutes"
          size="is-medium"
          show-value
        >
          scheduled
          <b>{{ scheduledMinutes }}</b> out of
          <b>{{ totalEstimatedMinutes }}</b> min
        </b-progress>
      </div>
      <div class="column">
        <b-progress
          :value="finishedMinutes"
          :max="scheduledMinutes"
          size="is-medium"
          show-value
        >
          {{ assessmentType === "assignment" ? "worked" : "studied" }} for
          <b>{{ finishedMinutes }}</b> out of
          <b>{{ scheduledMinutes }}</b> min
        </b-progress>
      </div>
    </div>

    <b-taglist v-if="assessment.shared">
      <span
        v-for="(rcsID, index) in assessment.sharedWith"
        :key="index"
        class="tag collaborator is-unselectable"
        :title="`Toggle showing ${rcsID}'s unavailability'`"
        :class="!hiding.includes(rcsID) ? 'is-dark' : ''"
        @click="toggleCollaboratorUnavailabilityHiding(rcsID)"
      >
        {{ rcsID }}
        {{
          collaboratorUnavailabilities[rcsID]
            ? ` | ${collaboratorUnavailabilities[rcsID].length}`
            : ""
        }}
      </span>
    </b-taglist>

    <FullCalendar
      ref="calendar"
      default-view="timeGridFiveDay"
      :events="totalEvents"
      :editable="true"
      :selectable="true"
      :plugins="calendar.plugins"
      :header="calendar.header"
      :views="calendar.views"
      :valid-range="validRange"
      :select-constraint="selectConstraint"
      :event-constraint="selectConstraint"
      :business-hours="calendar.businessHours"
      :height="700"
      all-day-text="Due"
      :scroll-time="calendar.scrollTime"
      :event-overlap="true"
      :select-mirror="true"
      :event-color="course.color"
      :now-indicator="true"
      :button-text="calendar.buttonText"
      time-format="h(:mm)t"
      no-events-message="No work sessions set yet!"
      snap-duration="00:15"
      time-zone="local"
      :event-render="eventRender"
      @eventResize="eventResize"
      @eventDrop="eventDrop"
      @select="select"
    />
  </div>
</template>

<script>
import moment from 'moment'
import assessmentsMixin from '@/mixins/assessments'
import fullcalendar from '@/mixins/fullcalendar'

import FullCalendar from '@fullcalendar/vue'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

import '@fullcalendar/core/main.css'
import '@fullcalendar/daygrid/main.css'
import '@fullcalendar/timegrid/main.css'

export default {
  name: 'AsessmentOverviewTabsWorkSchedule',
  components: { FullCalendar },
  mixins: [fullcalendar, assessmentsMixin],
  props: {
    assessment: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      hiding: [],
      collaboratorUnavailabilities: {},
      loading: true,
      saved: true,
      calendar: {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        header: {
          right: 'today,prev,next'
        },
        buttonText: {
          today: 'Today'
        },
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
        businessHours: {
          daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
          startTime: this.$store.state.auth.user.earliestWorkTime,
          endTime: this.$store.state.auth.user.latestWorkTime
        },
        scrollTime: this.$store.state.auth.user.earliestWorkTime

        // eventClick: this.eventClick,
        // eventDrop: this.eventDrop

      }
    }
  },
  computed: {
    selectConstraint () {
      // If assessment is a completed assignment, the completedAt date might be earlier and should be used
      if (this.assessmentType === 'assignment' && this.assessment.completedAt && moment(this.assessment.completedAt).isBefore(this.assessmentDate)) {
        return { end: this.assessment.completedAt }
      }
      return { end: this.assessmentDate }
    },
    scheduledMinutes () {
      if (!this.assessment._blocks) return 0

      return this.assessment._blocks.reduce(
        (acc, block) => acc + block.duration,
        0
      )
    },
    finishedMinutes () {
      // TODO added new may need to take exam model into account in calculation separately
      return this.assessment._blocks
        .filter(b => b.passed)
        .reduce((acc, block) => acc + block.duration, 0)
    },
    totalEstimatedMinutes () {
      return this.assessment.timeEstimate * 60
    },
    scheduledPercent () {
      if (this.totalEstimatedMinutes !== 0) {
        return Math.round(
          (this.scheduledMinutes / this.totalEstimatedMinutes) * 100
        )
      } else {
        return 0
      }
    },
    finishedPercent () {
      // TODO added new
      if (this.scheduledMinutes !== 0) {
        return Math.round((this.finishedMinutes / this.scheduledMinutes) * 100)
      } else {
        return 0
      }
    },
    assessmentDate () {
      if (this.assessmentType === 'exam') return this.assessment.date
      else return this.assessment.dueDate
    },
    start () {
      return moment(this.currentTerm.startDate).startOf('day')
    },
    end () {
      return moment(this.assessmentDate).endOf('day')
    },
    dueDateEvent () {
      return {
        eventType: 'due-date',
        title:
          (this.assessmentType === 'assignment' ? 'Due' : 'Taken') +
          ' @ ' +
          moment(this.assessmentDate).format('h:mma'),
        editable: false,
        start: this.assessmentDate,
        color: this.course.color,
        allDay: true
      }
    },
    courseScheduleEvents () {
      // Show course schedule events in they are the same course as the assessment
      return this.$store.getters.getCourseScheduleAsEvents.map(e =>
        Object.assign(
          { rendering: e.course.crn === this.course.crn ? '' : 'background' },
          e
        )
      )
    },
    courseBlockEvents () {
      return this.$store.getters.getCourseBlocksAsEvents.map(e =>
        Object.assign({}, { rendering: 'background' }, e))
    },
    todoBlockEvents () {
      return this.$store.getters.getTodoBlocksAsEvents.map(e =>
        Object.assign({}, { rendering: 'background' }, e))
    },
    unavailabilitySchedule () {
      return this.$store.getters.getUnavailabilityAsEvents.map(e =>
        Object.assign({}, e, {
          backgroundColor: 'black',
          rendering: 'background'
        })
      )
    },
    collaboratorUnavailabilitySchedule () {
      const events = []
      for (const rcsID in this.collaboratorUnavailabilities) {
        if (this.hiding.includes(rcsID)) continue

        events.push(
          this.collaboratorUnavailabilities[rcsID].map(p => ({
            ...this.$store.getters.mapUnavailabilityToEvent(p),
            backgroundColor: 'black',
            rendering: 'background'
          }))
        )
      }
      return events.flat()
    },
    assessmentBlockEvents () {
      return this.assessment._blocks
        .map(block =>
          this.$store.getters.mapAssessmentBlockToEvent(
            this.assessmentType,
            this.assessment,
            block
          )
        )
        .concat(
          this.$store.getters.getAssessmentBlocksAsEvents
            .filter(ev => ev.assessment._id !== this.assessment._id)
            .map(ev => Object.assign({ rendering: 'background' }, ev))
        )
    },
    totalEvents () {
      // Render work blocks for other assessments in the background
      return this.assessmentBlockEvents
        .concat(this.courseScheduleEvents)
        .concat(this.unavailabilitySchedule)
        .concat(this.collaboratorUnavailabilitySchedule)
        .concat(this.courseBlockEvents)
        .concat(this.todoBlockEvents)
        .concat([this.dueDateEvent])
    }
  },
  watch: {
    assessment (newAssessment) {
      this.getCollaboratorUnavailabilities()
    }
  },
  created () {
    this.getCollaboratorUnavailabilities()
  },
  mounted () {
    if (
      typeof window.orientation !== 'undefined' ||
      navigator.userAgent.indexOf('IEMobile') !== -1
    ) {
      // Show three day view on mobile
      const calendarApi = this.$refs.calendar.getApi()
      calendarApi.changeView('timeGridThreeDay')
    }
  },
  methods: {
    validRange (nowDate) {
      return {
        start: this.start.toDate(),
        end: this.end.toDate()
      }
    },
    toggleCollaboratorUnavailabilityHiding (rcsID) {
      if (this.hiding.includes(rcsID)) {
        this.hiding.splice(this.hiding.indexOf(rcsID), 1)
      } else {
        this.hiding.push(rcsID)
      }
    },
    async getCollaboratorUnavailabilities () {
      if (!this.assessment.shared) return

      this.loading = true

      let response
      try {
        response = await this.$http.get(
          '/assignments/a/' + this.assessment._id + '/collaborators'
        )
      } catch (e) {
        this.showError(e.response.data.message)
        return
      }

      this.collaboratorUnavailabilities = response.data.unavailabilities

      this.loading = false
    },
    async select ({ start, end }) {
      // Only confirm with user if they are trying to add work block to the past
      if (this.assessment.shared) {
        this.$buefy.dialog.confirm({
          message:
            'Schedule work block for everyone in this group assignment or just you?',
          cancelText: 'Just Me',
          confirmText: 'Group',
          onConfirm: () => this.addAssessmentBlock(start, end),
          onCancel: () => this.addAssessmentBlock(start, end, false)
        })
      } else if (moment(start).isBefore(moment())) {
        this.$buefy.dialog.confirm({
          message: 'Add work block to the past?',
          onConfirm: () => this.addAssessmentBlock(start, end),
          onCancel: () => {
            const calendarApi = this.$refs.calendar.getApi()
            calendarApi.unselect()
          }
        })
      } else {
        this.addAssessmentBlock(start, end)
      }
    },
    eventClick (calEvent, jsEvent, view) {
      if (calEvent.eventType !== 'assessment-block') return

      const dateStr = moment(calEvent.start).format('dddd M/D')
      const startStr = moment(calEvent.start).format('h:mm a')
      const endStr = moment(calEvent.end).format('h:mm a')

      this.$buefy.dialog.confirm({
        message: `Unschedule ${dateStr} from <b>${startStr}</b> to <b>${endStr}</b>${
          this.assessment.shared ? ' for everyone' : ''
        }?`,
        onConfirm: () => this.removeAssessmentBlock(calEvent.blockID)
      })
    },
    eventDrop ({ event, revert }) {
      const { blockID } = event.extendedProps

      // Update work block on server
      if (moment(event.end).isBefore(moment())) {
        this.$buefy.dialog.confirm({
          message: 'Move this past work block?',
          onConfirm: () =>
            this.editAssessmentBlock(blockID, event.start, event.end),
          onCancel: revert
        })
      } else {
        this.editAssessmentBlock(blockID, event.start, event.end)
      }
    },
    eventResize ({ event, revert }) {
      const { blockID } = event.extendedProps

      if (moment(event.end).isBefore(moment())) {
        this.$buefy.dialog.confirm({
          message: 'Edit this past work block?',
          onConfirm: () =>
            this.editAssessmentBlock(blockID, event.start, event.end),
          onCancel: revert
        })
      } else {
        this.editAssessmentBlock(blockID, event.start, event.end)
      }
    },
    async addAssessmentBlock (start, end, shared = true) {
      const updatedAssessment = await this.$store.dispatch('ADD_ASSESSMENT_BLOCK', {
        assessment: this.assessment,
        start,
        end,
        shared
      })

      this.$emit('updated-assessment', updatedAssessment)

      this.$buefy.toast.open({
        message: 'Added work block to your schedule!',
        type: 'is-primary'
      })

      const calendarApi = this.$refs.calendar.getApi()
      calendarApi.unselect()
    },
    async editAssessmentBlock (blockID, start, end) {
      const updatedAssessment = await this.$store.dispatch('EDIT_ASSESSMENT_BLOCK', {
        assessment: this.assessment,
        blockID,
        start,
        end
      })

      const message = 'Rescheduled work block!'

      this.$emit('updated-assessment', updatedAssessment)

      this.$buefy.toast.open({
        message,
        type: 'is-info'
      })
    },
    async removeAssessmentBlock (blockID) {
      // if upcoming, use Vuex, else directly call API
      const block = this.assessment._blocks.find(b => b._id === blockID)
      if (!block) return

      const updatedAssessment = await this.$store.dispatch('REMOVE_ASSESSMENT_BLOCK', {
        assessment: this.assessment,
        blockID
      })
      const message = 'Removed work block from your schedule!'

      this.$emit('updated-assessment', updatedAssessment)

      this.$buefy.toast.open({
        message,
        type: 'is-success'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.collaborator {
  cursor: pointer;
}
</style>
