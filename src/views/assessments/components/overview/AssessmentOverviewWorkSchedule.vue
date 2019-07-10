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
      :events="totalEvents"
      :editable="true"
      :selectable="true"
      :header="calendar.header"
      :config="calendar.config"
    />
  </div>
</template>

<script>
import moment from 'moment';
import assessmentsMixin from '@/mixins/assessments';

import 'fullcalendar/dist/fullcalendar.css';
import { FullCalendar } from 'vue-full-calendar';

export default {
  name: 'AsessmentOverviewTabsWorkSchedule',
  components: { FullCalendar },
  mixins: [assessmentsMixin],
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
      saved: true
    };
  },
  computed: {
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
    editable () {
      if (this.assessmentType === 'exam') return !this.assessment.passed;
      return !this.assessment.completed && !this.assessment.passed;
    },
    assessmentDate () {
      if (this.assessmentType === 'exam') return this.assessment.date;
      else return this.assessment.dueDate;
    },
    calendar () {
      return {
        header: {},
        config: {
          snapDuration: '00:15',
          views: {
            agendaThreeDay: {
              type: 'agenda',
              duration: { days: 3 },
              buttonText: '3-Day'
            },
            agendaFiveDay: {
              type: 'agenda',
              duration: { days: 5 },
              buttonText: 'Week'
            }
          },
          validRange: {
            start: this.start,
            end: this.end
          },
          selectConstraint: { end: this.assessmentDate },
          height: 700,
          allDay: false,
          allDayText: 'Due',
          businessHours: {
            dow: [0, 1, 2, 3, 4, 5, 6],
            start: this.$store.state.auth.user.earliestWorkTime,
            end: this.$store.state.auth.user.latestWorkTime
          },
          scrollTime: this.$store.state.auth.user.earliestWorkTime,
          timezone: 'local',
          defaultView: 'agendaFiveDay',
          eventOverlap: true,
          selectHelper: false,
          nowIndicator: true,
          timeFormat: 'h(:mm)t',
          noEventsMessage: 'No work periods set yet.',
          eventRender: (event, el) => {
            if (event.eventType === 'course') {
              return moment(event.end).isBetween(
                event.course.startDate,
                event.course.endDate
              );
            }
            if (event.eventType === 'work-block') {
              el.attr(
                'title',
                `${
                  event.assessment.assessmentType === 'assignment'
                    ? 'Work on'
                    : 'Study for'
                } ${event.assessment.title}${
                  event.block.location ? ' | ' + event.block.location : ''
                }`
              );

              const locationEl = document.createElement('i');
              locationEl.title = 'Click to set location';
              if (event.block.location) {
                locationEl.innerText = event.block.location;
              } else {
                locationEl.className = 'fas fa-map-marker-alt';
              }
              locationEl.classList.add('event-location');
              locationEl.onclick = ev => {
                ev.stopPropagation();
                this.$dialog.prompt({
                  message: 'Where do you want this to be?',
                  inputAttrs: {
                    placeholder: event.block.location
                      ? event.block.location
                      : 'e.g. Bray Hall Classroom',
                    maxlength: 200
                  },
                  onConfirm: async location => {
                    const updatedAssessment = await this.$store.dispatch(
                      'EDIT_WORK_BLOCK',
                      {
                        assessment: event.assessment,
                        blockID: event.blockID,
                        start: event.start,
                        end: event.end,
                        location
                      }
                    );

                    this.$emit('updated-assessment', updatedAssessment);

                    this.$toast.open({
                      message: `Updated location to <b>${location}</b>!`,
                      type: 'is-success'
                    });
                  }
                });
              };
              el.find('.fc-content').append(locationEl);
            }
            if (
              event.eventType === 'work-block' &&
              this.assessment.shared &&
              event.block.shared
            ) {
              const sharedIcon = document.createElement('i');
              sharedIcon.className = 'fas fa-users margin-left';
              el.find('.fc-title').append(sharedIcon);
            }
          },
          buttonText: {
            agendaWeek: 'Weekly Agenda'
          },
          eventClick: this.eventClick,
          eventDrop: this.eventDrop,
          eventResize: this.eventResize,
          select: this.select
        }
      };
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
        start: moment(this.assessmentDate).startOf('day'),
        // end: moment(this.assessmentDate).add(20, 'minute')
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
    },
    end (newEnd) {
      this.$refs.calendar.fireMethod('option', 'validRange', {
        start: this.start,
        end: newEnd
      });
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
      this.$refs.calendar.fireMethod('changeView', 'agendaThreeDay');
    }
  },
  methods: {
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
    async select (start, end) {
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
          onCancel: () => this.$refs.calendar.fireMethod('unselect')
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
    eventDrop (calEvent, delta, revertFunc, jsEvent, ui, view) {
      // Update work block on server
      if (calEvent.end.isBefore(moment())) {
        this.$dialog.confirm({
          message: 'Move this past work block?',
          onConfirm: () =>
            this.editWorkBlock(calEvent.blockID, calEvent.start, calEvent.end),
          onCancel: revertFunc
        });
      } else {
        this.editWorkBlock(calEvent.blockID, calEvent.start, calEvent.end);
      }
    },
    eventResize (calEvent, delta, revertFunc) {
      if (calEvent.end.isBefore(moment())) {
        this.$dialog.confirm({
          message: 'Edit this past work block?',
          onConfirm: () =>
            this.editWorkBlock(calEvent.blockID, calEvent.start, calEvent.end),
          onCancel: revertFunc
        });
      } else {
        this.editWorkBlock(calEvent.blockID, calEvent.start, calEvent.end);
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
        type: 'is-success'
      });

      this.$refs.calendar.fireMethod('unselect');
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
</style>
