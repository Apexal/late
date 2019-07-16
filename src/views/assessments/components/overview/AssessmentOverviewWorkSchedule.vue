<!--Assessments: assessment overview work schedule module-->
<template>
  <div
    id="assessment-work-schedule"
    class="assessment-work-schedule"
  >
    <div class="box">
      <div class="columns percents">
        <div
          class="column is-one-half tooltip"
          :data-tooltip="scheduledPercent + '% scheduled'"
        >
          <div class="is-narrow">
            You've scheduled
            <b>{{ scheduledMinutes }}</b> out of
            <b>{{ totalEstimatedMinutes }}</b>
            minutes to {{ assessmentType === "assignment" ? "work" : "study" }}.
          </div>
          <div class>
            <progress
              class="progress is-info"
              :value="scheduledMinutes"
              :max="totalEstimatedMinutes"
            >
              {{ scheduledPercent }}%
            </progress>
          </div>
        </div>

        <div
          class="column is-one-half tooltip"
          :data-tooltip="finishedPercent + '% finished'"
        >
          <div class="is-narrow">
            You've finished
            <b>{{ finishedMinutes }}</b> out of
            <b>{{ scheduledMinutes }}</b>
            scheduled minutes to
            {{ assessmentType === "assignment" ? "work" : "study" }}.
          </div>
          <div class>
            <progress
              class="progress is-success"
              :value="finishedMinutes"
              :max="scheduledMinutes"
            >
              {{ finishedPercent }}%
            </progress>
          </div>
        </div>
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
      :business-hours="calendar.businessHours"
      :height="700"
      all-day-text="Due"
      :scroll-time="calendar.scrollTime"
      :event-overlap="true"
      :select-helper="true"
      :now-indicator="true"
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
import moment from 'moment';
import assessmentsMixin from '@/mixins/assessments';
import fullcalendar from '@/mixins/fullcalendar';

import FullCalendar from '@fullcalendar/vue';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import '@fullcalendar/core/main.css';
import '@fullcalendar/daygrid/main.css';
import '@fullcalendar/timegrid/main.css';

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
        plugins: [ dayGridPlugin, timeGridPlugin, interactionPlugin ],
        header: {},
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
    };
  },
  computed: {
    selectConstraint () {
      return { end: this.assessmentDate };
    },
    scheduledMinutes () {
      if (!this.assessment._blocks) return 0;

      return this.assessment._blocks.reduce(
        (acc, block) => acc + block.duration,
        0
      );
    },
    finishedMinutes () {
      // TODO added new may need to take exam model into account in calculation separately
      return this.assessment._blocks
        .filter(b => b.passed)
        .reduce((acc, block) => acc + block.duration, 0);
    },
    totalEstimatedMinutes () {
      return this.assessment.timeEstimate * 60;
    },
    scheduledPercent () {
      if (this.totalEstimatedMinutes !== 0) {
        return Math.round(
          (this.scheduledMinutes / this.totalEstimatedMinutes) * 100
        );
      } else {
        return 0;
      }
    },
    finishedPercent () {
      // TODO added new
      if (this.scheduledMinutes !== 0) {
        return Math.round((this.finishedMinutes / this.scheduledMinutes) * 100);
      } else {
        return 0;
      }
    },
    assessmentDate () {
      if (this.assessmentType === 'exam') return this.assessment.date;
      else return this.assessment.dueDate;
    },
    start () {
      return moment(this.currentTerm.start).startOf('day');
    },
    end () {
      return moment(this.assessmentDate).endOf('day');
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
      };
    },
    courseScheduleEvents () {
      // Show course schedule events in they are the same course as the assessment
      return this.$store.getters.getCourseScheduleAsEvents.map(e =>
        Object.assign(
          { rendering: e.course.crn === this.course.crn ? '' : 'background' },
          e
        )
      );
    },
    unavailabilitySchedule () {
      return this.$store.getters.getUnavailabilityAsEvents.map(e =>
        Object.assign({}, e, {
          backgroundColor: 'black',
          rendering: 'background'
        })
      );
    },
    collaboratorUnavailabilitySchedule () {
      const events = [];
      for (let rcsID in this.collaboratorUnavailabilities) {
        if (this.hiding.includes(rcsID)) continue;

        events.push(
          this.collaboratorUnavailabilities[rcsID].map(p => ({
            ...this.$store.getters.mapUnavailabilityToEvent(p),
            backgroundColor: 'black',
            rendering: 'background'
          }))
        );
      }
      return events.flat();
    },
    workBlockEvents () {
      return this.assessment._blocks
        .map(block =>
          this.$store.getters.mapWorkBlockToEvent(
            this.assessmentType,
            this.assessment,
            block
          )
        )
        .concat(
          this.$store.getters.getWorkBlocksAsEvents
            .filter(ev => ev.assessment._id !== this.assessment._id)
            .map(ev => Object.assign({ rendering: 'background' }, ev))
        );
    },
    totalEvents () {
      // Render work blocks for other assessments in the background
      return this.workBlockEvents
        .concat(this.courseScheduleEvents)
        .concat(this.unavailabilitySchedule)
        .concat(this.collaboratorUnavailabilitySchedule)
        .concat([this.dueDateEvent]);
    }
  },
  watch: {
    assessment (newAssessment) {
      this.getCollaboratorUnavailabilities();
    }
  },
  created () {
    this.getCollaboratorUnavailabilities();
  },
  mounted () {
    if (
      typeof window.orientation !== 'undefined' ||
      navigator.userAgent.indexOf('IEMobile') !== -1
    ) {
      // Show three day view on mobile
      let calendarApi = this.$refs.calendar.getApi();
      calendarApi.changeView('timeGridThreeDay');
    }
  },
  methods: {
    validRange (nowDate) {
      return {
        start: this.start.toDate(),
        end: this.end.toDate()
      };
    },
    toggleCollaboratorUnavailabilityHiding (rcsID) {
      if (this.hiding.includes(rcsID)) {
        this.hiding.splice(this.hiding.indexOf(rcsID), 1);
      } else {
        this.hiding.push(rcsID);
      }
    },
    async getCollaboratorUnavailabilities () {
      if (!this.assessment.shared) return;

      this.loading = true;

      let response;
      try {
        response = await this.$http.get(
          '/assignments/a/' + this.assessment._id + '/collaborators'
        );
      } catch (e) {
        this.$toast.open({
          type: 'is-danger',
          message: e.response.data.message
        });
        return;
      }

      this.collaboratorUnavailabilities = response.data.unavailabilities;

      this.loading = false;
    },
    async select ({ start, end }) {
      // Only confirm with user if they are trying to add work block to the past
      if (this.assessment.shared) {
        this.$dialog.confirm({
          message:
            'Schedule work block for everyone in this group assignment or just you?',
          cancelText: 'Just Me',
          confirmText: 'Group',
          onConfirm: () => this.addWorkBlock(start, end),
          onCancel: () => this.addWorkBlock(start, end, false)
        });
      } else if (moment(start).isBefore(moment())) {
        this.$dialog.confirm({
          message: 'Add work block to the past?',
          onConfirm: () => this.addWorkBlock(start, end),
          onCancel: () => {
            let calendarApi = this.$refs.calendar.getApi();
            calendarApi.unselect();
          }
        });
      } else {
        this.addWorkBlock(start, end);
      }
    },
    eventClick (calEvent, jsEvent, view) {
      if (calEvent.eventType !== 'work-block') return;

      const dateStr = moment(calEvent.start).format('dddd M/D');
      const startStr = moment(calEvent.start).format('h:mm a');
      const endStr = moment(calEvent.end).format('h:mm a');

      this.$dialog.confirm({
        message: `Unschedule ${dateStr} from <b>${startStr}</b> to <b>${endStr}</b>${
          this.assessment.shared ? ' for everyone' : ''
        }?`,
        onConfirm: () => this.removeWorkBlock(calEvent.blockID)
      });
    },
    eventDrop ({ event, revert }) {
      const { blockID } = event.extendedProps;

      // Update work block on server
      if (moment(event.end).isBefore(moment())) {
        this.$dialog.confirm({
          message: 'Move this past work block?',
          onConfirm: () =>
            this.editWorkBlock(blockID, event.start, event.end),
          onCancel: revert
        });
      } else {
        this.editWorkBlock(blockID, event.start, event.end);
      }
    },
    eventResize ({ event, revert }) {
      const { blockID } = event.extendedProps;

      if (moment(event.end).isBefore(moment())) {
        this.$dialog.confirm({
          message: 'Edit this past work block?',
          onConfirm: () =>
            this.editWorkBlock(blockID, event.start, event.end),
          onCancel: revert
        });
      } else {
        this.editWorkBlock(blockID, event.start, event.end);
      }
    },
    async addWorkBlock (start, end, shared = true) {
      const updatedAssessment = await this.$store.dispatch('ADD_WORK_BLOCK', {
        assessment: this.assessment,
        start,
        end,
        shared
      });

      this.$emit('updated-assessment', updatedAssessment);

      this.$toast.open({
        message: 'Added work block to your schedule!',
        type: 'is-primary'
      });

      let calendarApi = this.$refs.calendar.getApi();
      calendarApi.unselect();
    },
    async editWorkBlock (blockID, start, end) {
      let updatedAssessment = await this.$store.dispatch('EDIT_WORK_BLOCK', {
        assessment: this.assessment,
        blockID,
        start,
        end
      });

      let message = 'Rescheduled work block!';

      this.$emit('updated-assessment', updatedAssessment);

      this.$toast.open({
        message,
        type: 'is-info'
      });
    },
    async removeWorkBlock (blockID) {
      // if upcoming, use Vuex, else directly call API
      const block = this.assessment._blocks.find(b => b._id === blockID);
      if (!block) return;

      let updatedAssessment = await this.$store.dispatch('REMOVE_WORK_BLOCK', {
        assessment: this.assessment,
        blockID
      });
      let message = 'Removed work block from your schedule!';

      this.$emit('updated-assessment', updatedAssessment);

      this.$toast.open({
        message,
        type: 'is-success'
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.box.percents {
  padding: 10px;
}

.collaborator {
  cursor: pointer;
}

.fc-content .remove-work-block {
  display: none;
  position: absolute;
  right: 0;
  top: 0;
}
</style>
