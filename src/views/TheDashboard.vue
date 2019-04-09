<template>
  <section class="section dasboard">
    <h1 class="is-hidden-desktop has-text-centered is-marginless title">
      Your Dashboard
    </h1>

    <div class="tabs is-centered">
      <ul>
        <h1
          class="is-hidden-touch title"
          style="flex: 1"
        >
          Your Dashboard
        </h1>
        <li>
          <a
            title="(WIP) View your weekly schedule"
            style="cursor: not-allowed;"
          >Your Week</a>
        </li>
        <li
          class="is-active"
          title="View calendar"
        >
          <a>Calendar</a>
        </li>
      </ul>
    </div>
    <template v-if="onBreak">
      <h2 class="subtitle">
        On Break
      </h2>
    </template>
    <div
      v-else
      id="calendar-holder"
    >
      <DashboardCalendarSelectModal
        :open="selectModal.open"
        :start="selectModal.start"
        :end="selectModal.end"
        :assessments="filteredUpcomingAssessments"
        @add-work-block="addWorkBlock"
        @close-modal="selectModal.open = false"
      />
      <FullCalendar
        ref="calendar"
        :events="events"
        :editable="true"
        :selectable="true"
        :header="calendar.header"
        :config="calendar.config"
      />
      <button
        title="Toggle Fullscreen"
        class="button fullscreenToggle"
        @click="toggleFullscreen"
      >
        <i class="fas fa-expand-arrows-alt" />
      </button>
    </div>
  </section>
</template>

<script>
import { FullCalendar } from 'vue-full-calendar';
import 'fullcalendar/dist/fullcalendar.css';

import moment from 'moment';

import DashboardCalendarSelectModal from '@/views/components/dashboard/DashboardCalendarSelectModal';

export default {
  name: 'TheDashboard',
  components: { DashboardCalendarSelectModal, FullCalendar },
  data () {
    return {
      selectModal: {
        open: false,
        start: moment(),
        end: moment()
      },
      calendar: {
        header: {
          center: 'agendaThreeDay, agendaFiveDay, agendaWeek'
        },
        config: {
          displayEventTime: true,
          views: {
            agendaThreeDay: {
              type: 'agenda',
              duration: { days: 3 },
              buttonText: '3-Day'
            },
            agendaFiveDay: {
              type: 'agenda',
              duration: { days: 5 },
              buttonText: '5-Day'
            }
          },
          validRange: {
            start: this.$store.getters.currentTerm.start,
            end: this.$store.getters.currentTerm.end
          },
          height: 'parent',
          dayCount: 5,
          allDayText: 'Due',
          // minTime: this.$store.state.auth.user.earliestWorkTime + ':00',
          // maxTime: this.$store.state.auth.user.latestWorkTime + ':00',
          businessHours: {
            dow: [0, 1, 2, 3, 4, 5, 6],
            start: this.$store.state.auth.user.earliestWorkTime,
            end: this.$store.state.auth.user.latestWorkTime
          },
          timezone: 'local',
          defaultView: 'agendaFiveDay',
          eventOverlap: true,
          selectOverlap: true,
          selectHelper: true,
          nowIndicator: true,
          timeFormat: 'h(:mm)t',
          snapDuration: '00:15',
          noEventsMessage: 'You\'ve got nothing to do. You can relax!',
          eventRender: (event, el) => {
            el.attr(
              'title',
              event.period ? event.period.location : event.title
            );
            if (event.eventType === 'course') {
              if (event.period.type === 'TES') {
                return !!this.$store.state.work.upcomingAssessments.find(
                  assessment =>
                    assessment.assessmentType === 'exam' &&
                    assessment.courseCRN === event.course.crn &&
                    moment(assessment.date).isSame(event.start, 'day')
                );
              }

              // No classes after classes end date
              if (moment(event.start).isAfter(this.term.classesEnd)) {
                return false;
              }
            } else {
            }
          },
          buttonText: {
            today: 'Today',
            agendaWeek: 'Week'
          },
          /* dayClick: (date, jsEvent, view) => {
            // this.$store.commit('SET_ADD_ASSIGNMENT_MODAL_DUE_DATE', date);
            // this.$store.commit('TOGGLE_ADD_ASSIGNMENT_MODAL');
          },
          */
          eventClick: this.eventClick,
          eventDrop: this.eventDrop,
          eventResize: this.eventResize,
          select: this.select
        }
      }
    };
  },
  computed: {
    isFullscreen () {
      return document.fullscreenElement !== null;
    },
    onBreak () {
      return this.$store.getters.onBreak;
    },
    term () {
      return this.$store.getters.currentTerm;
    },
    filteredUpcomingAssessments () {
      return this.$store.state.work.upcomingAssessments.filter(
        assessment =>
          moment(this.selectModal.end).isBefore(
            assessment.dueDate || assessment.date
          ) &&
          (assessment.assessmentType === 'exam' ||
          (assessment.assessmentType === 'assignment' &&
          !assessment.completed))
      );
    },
    events () {
      const courseSchedule = this.$store.getters.getCourseScheduleAsEvents;

      const unavailabilitySchedule = this.$store.getters
        .getUnavailabilityAsEvents;

      const upcomingAssessments = this.$store.getters.getUpcomingAssessmentsAsEvents.filter(
        event => {
          if (event.eventType === 'assignment') {
            return !event.assignment.completed;
          }
          return true;
        }
      );

      const workBlocks = this.$store.getters.getWorkBlocksAsEvents;

      return courseSchedule
        .concat(upcomingAssessments)
        .concat(unavailabilitySchedule)
        .concat(workBlocks);
    },
    earliest () {
      let earliest = this.$store.state.auth.user.earliestWorkTime;
      const courses = this.$store.getters.getCourseScheduleAsEvents;
      const workBlocks = this.$store.getters.getWorkBlocksAsEvents.map(e =>
        Object.assign({}, e)
      );

      let i;
      for (i = 0; i < courses.length; i++) {
        if (courses[i].start.localeCompare(earliest) < 0) {
          earliest = courses[i].start;
        }
      }
      for (i = 0; i < workBlocks.length; i++) {
        if (workBlocks[i].start.localeCompare(earliest) < 0) {
          earliest = workBlocks[i].start;
        }
      }

      return earliest;
    }
  },
  watch: {
    earliest (newEarliest) {
      this.calendar.config.scrollTime = this.earliest;
      this.$refs.calendar.fireMethod(
        'option',
        'scrollTime',
        this.calendar.config.scrollTime
      );
    }
  },
  created () {
    this.calendar.config.scrollTime = this.earliest;
  },
  methods: {
    toggleFullscreen () {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        let div = document.getElementById('calendar-holder');
        div.requestFullscreen();
      }
    },
    select (start, end, jsEvent, view) {
      // this.$toasted.show(
      //   'You will be able to schedule work blocks by selecting soon.'
      // );
      this.selectModal.start = start;
      this.selectModal.end = end;
      this.selectModal.open = true;
    },
    async addWorkBlock (assessment) {
      if (!assessment || !this.selectModal.open) return;

      const updatedAssessment = await this.$store.dispatch('ADD_WORK_BLOCK', {
        assessment,
        start: this.selectModal.start,
        end: this.selectModal.end
      });

      this.$toasted.success('Added work block to your schedule!', {
        icon: 'clock',
        duration: 2000,
        fullWidth: false,
        position: 'top-right'
      });

      this.selectModal.open = false;
      this.$refs.calendar.fireMethod('unselect');
    },
    eventClick (calEvent, jsEvent, view) {
      if (calEvent.eventType === 'course') {
        this.$store.commit('SET_ADD_ASSIGNMENT_MODAL_VALUES', {
          dueDate: calEvent.start,
          dueTime: moment(calEvent.start).format('HH:mm')
        });
        this.$store.commit('SET_ADD_EXAM_MODAL_VALUES', {
          date: calEvent.start,
          time: moment(calEvent.start).format('HH:mm')
        });
        this.$store.commit('OPEN_COURSE_MODAL', calEvent.course);
      } else if (calEvent.eventType === 'assignment') {
        this.$router.push({
          name: 'assignment-overview',
          params: { assignmentID: calEvent.assignment._id }
        });
      } else if (calEvent.eventType === 'exam') {
        this.$router.push({
          name: 'exam-overview',
          params: { examID: calEvent.exam._id }
        });
      } else if (calEvent.eventType === 'work-block') {
        if (calEvent.assessmentType === 'assignment') {
          this.$router.push({
            name: 'assignment-overview',
            params: { assignmentID: calEvent.assignment._id }
          });
        } else if (calEvent.assessmentType === 'exam') {
          this.$router.push({
            name: 'exam-overview',
            params: { examID: calEvent.exam._id }
          });
        }
      }
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
    async editWorkBlock (blockID, start, end) {
      const updatedAssessment = await this.$store.dispatch('EDIT_WORK_BLOCK', {
        blockID,
        start,
        end
      });

      this.$toasted.show('Rescheduled work block!', {
        icon: 'clock',
        duration: 2000,
        fullWidth: false,
        position: 'top-right'
      });
    }
  }
};
</script>

<style lang='scss'>
.tabs .title {
  margin: 0;
}
.work-block-event {
  border-width: 3px !important;
}

.dashboard-calendar-select-modal .panel {
  .assessment-type-tag {
    text-transform: capitalize;
    color: white;
  }
  b {
    font-weight: normal;
  }
  .panel-block {
    background-color: white;
    cursor: pointer;
  }
}

.fc .fc-toolbar > * > * {
  margin: 0 auto;
}

.fc-center,
.fc-right {
  * {
    border-style: none;
    color: #444444;
  }

  .fc-state-active {
    color: black;
  }

  .fc-button:hover {
    color: black;
  }
  border: 1px solid #dbdbdb;
  border-radius: 4px;
}

.fc-right .fc-button-group {
  border-left: 1px solid #dbdbdb;
  margin-left: 5px;
}

#calendar-holder {
  height: 700px;
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
.fullscreenToggle {
  float: right;
  margin-top: -35px;
  z-index: 1000;
}
</style>
