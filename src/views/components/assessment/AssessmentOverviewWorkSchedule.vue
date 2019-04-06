<template>
  <div class="assessment-work-schedule">
    <div
      v-if="locked"
      class="notification is-warning"
    >
      <i class="fa fa-lock" />
      This {{ assessmentType }} is overdue so your work schedule can no longer be changed.
    </div>

    <div class="box columns percents">
      <div
        class="column is-one-half tooltip"
        :data-tooltip="scheduledPercent + '% scheduled'"
      >
        <div class="is-narrow">
          You've scheduled
          <b>{{ scheduledMinutes }}</b> out of
          <b>{{ totalEstimatedMinutes }}</b>
          minutes to {{ assessmentType === 'assignment' ? 'work' : 'study' }}.
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
          scheduled minutes to {{ assessmentType === 'assignment' ? 'work' : 'study' }}.
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

import 'fullcalendar/dist/fullcalendar.css';
import { FullCalendar } from 'vue-full-calendar';

export default {
  name: 'AsessmentOverviewTabsWorkSchedule',
  components: { FullCalendar },
  props: {
    assessment: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      saved: true
    };
  },
  computed: {
    assessmentType () {
      return this.assessment.assessmentType;
    },
    assessmentTypeCapitalized () {
      return this.assessmentType === 'assignment' ? 'Assignment' : 'Exam';
    },
    locked () {
      if (this.assessmentType === 'assignment') {
        return this.assessment.completed || this.assessment.passed;
      } else if (this.assessmentType === 'exam') return this.passed;
      return false;
    },
    scheduledMinutes () {
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
    term () {
      return this.$store.getters.currentTerm;
    },
    calendar () {
      return {
        header: {},
        config: {
          snapDuration: '00:15',
          views: {
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
              if (moment(event.start).isAfter(this.term.classesEnd)) {
                return false;
              }
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
      return moment(this.$store.getters.currentTerm.start).startOf('day');
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
    course () {
      return this.$store.getters.getCourseFromCRN(this.assessment.courseCRN);
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
        .concat([this.dueDateEvent]);
    }
  },
  watch: {
    end (newEnd) {
      this.$refs.calendar.fireMethod('option', 'validRange', {
        start: this.start,
        end: newEnd
      });
    }
  },
  methods: {
    async select (start, end) {
      // Only confirm with user if they are trying to add work block to the past
      if (moment(start).isBefore(moment())) {
        if (
          !confirm(
            `Add work block to your history for ${moment(start).format(
              'M/DD/YY'
            )}?`
          )
        ) {
          return this.$refs.calendar.fireMethod('unselect');
        }
      }

      this.addWorkBlock(start, end);
    },
    eventClick (calEvent, jsEvent, view) {
      if (calEvent.eventType !== 'work-block') return;

      if (moment(calEvent.end).isBefore(moment())) {
        if (!confirm('Remove this work block from your history?')) return;
      } else {
        const assessmentTitle = this.assessment.title;
        const dateStr = moment(calEvent.start).format('dddd');
        const startStr = moment(calEvent.start).format('h:mm a');
        const endStr = moment(calEvent.end).format('h:mm a');

        if (
          !confirm(
            `You no longer want to ${
              this.assessmentType === 'assignment' ? 'work on' : 'study for'
            } ${assessmentTitle} on ${dateStr} from ${startStr} to ${endStr}?`
          )
        ) {
          return;
        }
      }

      this.removeWorkBlock(calEvent.blockID);
    },
    eventDrop (calEvent, delta, revertFunc, jsEvent, ui, view) {
      // Update work block on server
      if (calEvent.end.isBefore(moment())) {
        if (!confirm('Move this work block to your history?')) {
          return revertFunc();
        }
      }
      this.editWorkBlock(calEvent.blockID, calEvent.start, calEvent.end);
    },
    eventResize (calEvent, delta, revertFunc) {
      if (moment(calEvent.end).isBefore(moment())) {
        if (!confirm('Edit this work block from your history?')) {
          return revertFunc();
        }
      }
      this.editWorkBlock(calEvent.blockID, calEvent.start, calEvent.end);
    },
    async addWorkBlock (start, end) {
      const updatedAssessment = await this.$store.dispatch('ADD_WORK_BLOCK', {
        assessmentType: this.assessmentType,
        assessment: this.assessment,
        start,
        end
      });

      if (!this.$store.getters.getUpcomingAssessmentById(this.assessment._id)) {
        // Updated past assessment, send up to parent overview
        this.$emit('update-assessment', updatedAssessment);
      }

      this.$toasted.success('Added work block to your schedule!', {
        icon: 'clock',
        duration: 2000,
        fullWidth: false,
        position: 'top-right'
      });

      this.$refs.calendar.fireMethod('unselect');
    },
    async editWorkBlock (blockID, start, end) {
      let updatedAssessment;
      let message = 'Rescheduled work block!';

      if (
        // eslint-disable-next-line
        this.$store.getters.getUpcomingAssessmentById(this.assessment._id)
      ) {
        updatedAssessment = await this.$store.dispatch('EDIT_WORK_BLOCK', {
          blockID,
          start,
          end
        });
      } else {
        const request = await this.$http.patch(
          `/blocks/${this.assessmentType}/${this.assessment._id}/${blockID}`,
          {
            startTime: start,
            endTime: end,
            assessmentType: this.assessmentType
          }
        );

        updatedAssessment =
          request.data['updated' + this.assessmentTypeCapitalized];
        message = 'Edited past work block!';
        // Updated past assessment, send up to parent overview
        this.$emit('update-assessment', updatedAssessment);
      }

      this.$toasted.show(message, {
        icon: 'clock',
        duration: 2000,
        fullWidth: false,
        position: 'top-right'
      });
    },
    async removeWorkBlock (blockID) {
      // if upcoming, use Vuex, else directly call API
      const block = this.assessment._blocks.find(b => b._id === blockID);
      if (!block) return;

      let updatedAssessment;
      let message = 'Removed work block from your schedule!';

      if (
        // eslint-disable-next-line
        this.$store.getters.getUpcomingAssessmentById(this.assessment._id)
      ) {
        updatedAssessment = await this.$store.dispatch('REMOVE_WORK_BLOCK', {
          blockID
        });
        // Updated past assessment, send up to parent overview
      } else {
        const request = await this.$http.delete(
          `/blocks/${this.assessmentType}/${this.assessment._id}/${blockID}`
        );
        updatedAssessment =
          request.data['updated' + this.assessmentTypeCapitalized];
        message = 'Removed work block from your past schedule!';
        this.$emit('update-assessment', updatedAssessment);
      }

      this.$toasted.error(message, {
        icon: 'clock',
        duration: 2000,
        fullWidth: false,
        position: 'top-right'
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.box.percents {
  padding: 10px;
}
</style>
