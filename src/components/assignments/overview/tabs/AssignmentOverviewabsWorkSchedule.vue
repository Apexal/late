<template>
  <div class="assignment-work-schedule">
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

import { FullCalendar } from 'vue-full-calendar';
import 'fullcalendar/dist/fullcalendar.css';

export default {
  name: 'AssignmentOverviewabsWorkSchedule',
  components: { FullCalendar },
  props: {
    assignment: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      workBlocks: [],
      saved: true,
      calendar: {
        header: {
          center: 'agendaWeek'
        },
        config: {
          validRange: {
            start: moment().startOf('day'),
            end: moment(this.assignment.dueDate).endOf('day')
          },
          height: 500,
          allDay: false,
          minTime: this.$store.state.auth.user.earliestWorkTime,
          maxTime: this.$store.state.auth.user.latestWorkTime,
          timezone: 'local',
          defaultView: 'agendaWeek',
          eventOverlap: false,
          selectOverlap: false,
          selectHelper: false,
          nowIndicator: true,
          timeFormat: 'h(:mm)t',
          noEventsMessage: 'No work periods set yet.',
          buttonText: {
            agendaWeek: 'Weekly Agenda'
          },
          eventClick: (calEvent, jsEvent, view) => {
            // if (calEvent.eventType !== 'work-block') return;
            /* Remove work block */
            this.workBlocks = this.workBlocks.filter(
              e => !moment(e.start).isSame(moment(calEvent.start))
            );
            this.saved = false;
          },
          select: (start, end) => {
            const assignmentTitle = this.assignment.title;
            const dateStr = moment(start).format('dddd');
            const startStr = moment(start).format('h:mm a');
            const endStr = moment(end).format('h:mm a');
            if (!confirm(`You want to work on ${assignmentTitle} on ${dateStr} from ${startStr} to ${endStr}?`)) { return; }
            const eventData = {
              eventType: 'work-block',
              title: assignmentTitle,
              start: start,
              backgroundColor: 'black',
              borderColor: this.course.color,
              end: end,
              isWorkBlock: true
            };
            this.workBlocks.push(eventData);
            this.$refs.calendar.fireMethod('unselect');
            this.saved = false;

            // TODO: customize, top right
            this.$toasted.show('Added work block to your schedule!');

            this.$emit('add-work-block', eventData);
          }
        }
      }
    };
  },
  computed: {
    course () {
      return this.$store.getters.getCourseFromCRN(this.assignment.courseCRN);
    },
    courseScheduleEvents () {
      return this.$store.getters.getCourseScheduleAsEvents.map(
        e =>
          Object.assign({}, e, {
            rendering: 'background'
          })
      );
    },
    unavailabilitySchedule () {
      return this.$store.getters.getUnavailabilityAsEvents.map(
        e =>
          Object.assign({}, e, {
            backgroundColor: 'black',
            rendering: 'background'
          })
      );
    },
    workBlockEvents () {
      return this.$store.getters.getWorkBlocksAsEvents.map(
        e => {
          if (e.assignment._id !== this.assignment._id) {
            return Object.assign({}, e, { rendering: 'background' });
          }
          return e;
        }
      );
    },
    totalEvents () {
      // Render work blocks for other assignments in the background

      return this.workBlocks.concat(this.courseScheduleEvents).concat(this.unavailabilitySchedule);
    }
  },
  watch: {
    workBlockEvents () {
      this.workBlocks = this.workBlockEvents.slice(0);
    }
  },
  created () {
    this.workBlocks = this.workBlockEvents.slice(0);
  }
};
</script>

<style lang="scss" scoped>
</style>
