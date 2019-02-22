<template>
  <div class="assessment-work-schedule">
    <div
      v-if="locked"
      class="notification is-warning"
    >
      <i class="fa fa-lock" />
      This {{ assessmentType }} is done so your work schedule can no longer be changed.
    </div>

    <div
      class="box columns"
    >
      <div
        class="column is-one-half tooltip"
        :data-tooltip="scheduledPercent + '% scheduled'"
      >
        <div class=" is-narrow">
          You've scheduled
          <b>{{ scheduledMinutes }}</b> out of
          <b>{{ totalEstimatedMinutes }}</b>
          minutes to {{ assessmentType === 'assignment' ? 'work' : 'study' }}.
        </div>
        <div class="">
          <progress
            class="progress is-danger"
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
        <div class="">
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
      :editable="editable"
      :selectable="editable"
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
    assessmentType: {
      type: String,
      required: true
    },
    assessment: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      workBlocks: [],
      saved: true
    };
  },
  computed: {
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
      return this.assessment._blocks.filter(b => b.passed).reduce((acc, block) => acc + block.duration, 0);
    },
    totalEstimatedMinutes () {
      return this.assessment.timeEstimate * 60;
    },
    scheduledPercent () {
      return Math.round(
        (this.scheduledMinutes / this.totalEstimatedMinutes) * 100
      );
    },
    finishedPercent () { // TODO added new
      if (this.scheduledMinutes !== 0) {
        return Math.round(
          (this.finishedMinutes / this.scheduledMinutes) * 100
        );
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
        header: {
        },
        config: {
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
          minTime: this.$store.state.auth.user.earliestWorkTime,
          maxTime: this.$store.state.auth.user.latestWorkTime,
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
      return moment(this.assessment.createdAt).startOf('day');
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
      return this.$store.getters.getWorkBlocksAsEvents.map(e => {
        if (e.assessment._id !== this.assessment._id) {
          return Object.assign({}, e, {
            rendering: 'background'
          });
        }
        return e;
      });
    },
    totalEvents () {
      // Render work blocks for other assessments in the background

      return this.workBlocks
        .concat(this.courseScheduleEvents)
        .concat(this.unavailabilitySchedule)
        .concat([this.dueDateEvent]);
    }
  },
  watch: {
    workBlockEvents () {
      this.workBlocks = this.workBlockEvents.slice(0);
    },
    editable (newVal) {
      this.$refs.calendar.fireMethod('option', 'selectable', newVal);
      this.$refs.calendar.fireMethod('option', 'editable', newVal);
    },
    end (newEnd) {
      this.$refs.calendar.fireMethod('option', 'validRange', {
        start: this.start,
        end: newEnd
      });
    }
  },
  created () {
    this.workBlocks = this.workBlockEvents.slice(0);
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

      this.saved = false;

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

      this.saved = false;
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
      const capitalized =
        this.assessmentType === 'assignment' ? 'Assignment' : 'Exam';

      if (
        !this.$store.getters['getUpcoming' + capitalized + 'ById'](
          this.assessment._id
        )
      ) {
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
      const updatedAssessment = await this.$store.dispatch('EDIT_WORK_BLOCK', {
        blockID,
        start,
        end
      });

      const capitalized =
        this.assessmentType === 'assignment' ? 'Assignment' : 'Exam';
      if (
        !this.$store.getters['getUpcoming' + capitalized + 'ById'](
          this.assessment._id
        )
      ) {
        // Updated past assessment, send up to parent overview
        this.$emit('update-assessment', updatedAssessment);
      }

      this.$toasted.show('Rescheduled work block!', {
        icon: 'clock',
        duration: 2000,
        fullWidth: false,
        position: 'top-right'
      });
    },
    async removeWorkBlock (blockID) {
      const updatedAssessment = await this.$store.dispatch(
        'REMOVE_WORK_BLOCK',
        {
          blockID
        }
      );
      const capitalized =
        this.assessmentType === 'assignment' ? 'Assignment' : 'Exam';

      if (
        !this.$store.getters['getUpcoming' + capitalized + 'ById'](
          this.assessment._id
        )
      ) {
        // Updated past assessment, send up to parent overview
        this.$emit('update-assessment', updatedAssessment);
      }

      this.$toasted.error('Removed work block from your schedule!', {
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
</style>
