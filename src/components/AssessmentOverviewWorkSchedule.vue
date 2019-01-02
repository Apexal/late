<template>
  <div class="assessment-work-schedule">
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

import { FullCalendar } from 'vue-full-calendar';
import 'fullcalendar/dist/fullcalendar.css';

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
          center: 'agendaFiveDay'
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
          height: 500,
          allDay: false,
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
          selectConstraint: {
            start: new Date(),
            end: this.assessmentDate
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
        title: 'Assessment Due',
        editable: false,
        start: this.assessmentDate,
        color: this.course.color,
        end: moment(this.assessmentDate).add(20, 'minute')
      };
    },
    course () {
      return this.$store.getters.getCourseFromCRN(this.assessment.courseCRN);
    },
    courseScheduleEvents () {
      return this.$store.getters.getCourseScheduleAsEvents.map(e =>
        Object.assign({}, e, {
          rendering: 'background'
        })
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
          return Object.assign({}, e, { rendering: 'background' });
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
    /* end () {}, */
    workBlockEvents () {
      this.workBlocks = this.workBlockEvents.slice(0);
    }
  },
  created () {
    this.workBlocks = this.workBlockEvents.slice(0);
  },
  methods: {
    select (start, end) {
      const assessmentTitle = this.assessment.title;
      const dateStr = moment(start).format('dddd');
      const startStr = moment(start).format('h:mm a');
      const endStr = moment(end).format('h:mm a');
      if (
        !confirm(
          `You want to ${
            this.assessmentType === 'assignment' ? 'work on' : 'study for'
          } ${assessmentTitle} on ${dateStr} from ${startStr} to ${endStr}?`
        )
      ) {
        return;
      }

      this.$refs.calendar.fireMethod('unselect');
      this.saved = false;

      // TODO: customize, top right

      this.$emit('add-work-block', { start, end });
    },
    eventClick (calEvent, jsEvent, view) {
      if (calEvent.eventType !== 'work-block') return;

      // Cannot remove past blocks
      if (moment(calEvent.end).isBefore(moment())) {
        return this.$toasted.error('Cannot remove past work block!');
      }

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

      /* Remove work block */
      this.workBlocks = this.workBlocks.filter(
        e => !moment(e.start).isSame(moment(calEvent.start))
      );

      this.$emit('remove-work-block', calEvent.blockID);

      this.saved = false;
    },
    eventDrop (calEvent, delta, revertFunc, jsEvent, ui, view) {
      // Update work block on server
      this.$emit('edit-work-block', {
        blockID: calEvent.blockID,
        start: calEvent.start,
        end: calEvent.end
      });
    },
    eventResize (calEvent, delta, revertFunc) {
      this.$emit('edit-work-block', {
        blockID: calEvent.blockID,
        start: calEvent.start,
        end: calEvent.end
      });
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
