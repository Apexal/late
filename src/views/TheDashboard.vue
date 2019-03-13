<template>
  <section class="section dasboard">
    <div
      :class="{'is-active': selectModal.open}"
      class="modal dashboard-calendar-select-modal"
    >
      <div
        class="modal-background"
        @click="selectModal.open = !selectModal.open"
      />
      <div class="modal-content panel">
        <p class="panel-heading">
          Schedule
          <b>{{ selectModalDateStrs.start }}</b> to
          <b>{{ selectModalDateStrs.end }}</b>
        </p>
        <div
          v-if="filteredUpcomingAssessments.length === 0"
          class="panel-block has-text-grey"
        >
          No assignments or exams are open to work on at that time.
        </div>
        <div
          v-for="assessment in filteredUpcomingAssessments"
          :key="assessment._id"
          class="panel-block is-flex"
          @click="addWorkBlock(assessment)"
        >
          <span style="flex: 1">
            <span
              class="tag assessment-type-tag"
              :style="{ 'background-color': course(assessment.courseCRN).color }"
            >{{ assessment.assessmentType }}</span>
            {{ assessment.title }}
          </span>
          <span
            class="has-text-grey is-pulled-right"
          >due {{ formatDate(assessment.dueDate || assessment.date) }}</span>
        </div>
      </div>
      <button
        class="modal-close is-large"
        aria-label="close"
        @click="selectModal.open = !selectModal.open"
      />
    </div>

    <h1 class="is-hidden-desktop has-text-centered is-marginless title">
      The Dashboard
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
          <a title="View your weekly schedule">Your Week</a>
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
      <FullCalendar
        ref="calendar"
        :events="events"
        :editable="true"
        :selectable="true"
        :header="calendar.header"
        :config="calendar.config"
      />
      <button
        class="button"
        @click="toggleFullscreen"
      >
        Fullscreen
      </button>
    </div>
  </section>
</template>

<script>
import { FullCalendar } from 'vue-full-calendar';
import 'fullcalendar/dist/fullcalendar.css';

import moment from 'moment';

export default {
  name: 'TheDashboard',
  components: { FullCalendar },
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
            if (event.eventType === 'course') {
              if (event.period.type === 'TES') {
                return !!this.$store.state.work.upcomingExams.find(
                  ex =>
                    ex.courseCRN === event.course.crn &&
                    moment(ex.date).isSame(event.start, 'day')
                );
              }

              // No classes after classes end date
              if (moment(event.start).isAfter(this.term.classesEnd)) {
                return false;
              }
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
    selectModalDateStrs () {
      if (this.selectModal.start.isSame(this.selectModal.end, 'day')) {
        return {
          start: this.selectModal.start.format('M/D/YY h:mm a'),
          end: this.selectModal.end.format('h:mm a')
        };
      } else {
        return {
          start: this.selectModal.start.format('M/D/YY h:mm a'),
          end: this.selectModal.end.format('M/D/YY h:mm a')
        };
      }
    },
    filteredUpcomingAssessments () {
      return this.$store.state.work.upcomingAssignments
        .filter(
          assignment =>
            moment(this.selectModal.end).isBefore(assignment.dueDate) &&
            !assignment.completed
        )
        .map(assignment =>
          Object.assign({}, assignment, { assessmentType: 'assignment' })
        )
        .concat(
          this.$store.state.work.upcomingExams
            .filter(exam => this.selectModal.end < exam.date)
            .map(exam => Object.assign({}, exam, { assessmentType: 'exam' }))
        );
    },
    events () {
      const courseSchedule = this.$store.getters.getCourseScheduleAsEvents;

      const incompleteUpcomingAssignments = this.$store.getters.getUpcomingAssigmentsAsEvents.filter(
        c => !c.assignment.completed
      );

      const unavailabilitySchedule = this.$store.getters
        .getUnavailabilityAsEvents;

      const upcomingExams = this.$store.getters.getUpcomingExamsAsEvents;

      const workBlocks = this.$store.getters.getWorkBlocksAsEvents.map(e =>
        Object.assign({}, e)
      );

      return courseSchedule
        .concat(incompleteUpcomingAssignments)
        .concat(unavailabilitySchedule)
        .concat(upcomingExams)
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
    course (crn) {
      return this.$store.getters.getCourseFromCRN(crn);
    },
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
      this.selectModal.open = true;
      this.selectModal.start = start;
      this.selectModal.end = end;
    },
    async addWorkBlock (assessment) {
      if (!assessment || !this.selectModal.open) return;

      const updatedAssessment = await this.$store.dispatch('ADD_WORK_BLOCK', {
        assessmentType: assessment.assessmentType,
        assessment: assessment,
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
          dueDate: calEvent.start
        });
        this.$store.commit('OPEN_COURSE_MODAL', calEvent.course);
      } else if (calEvent.eventType === 'assignment') {
        this.$router.push({
          name: 'assignments-overview',
          params: { assignmentID: calEvent.assignment._id }
        });
      } else if (calEvent.eventType === 'exam') {
        this.$router.push({
          name: 'exams-overview',
          params: { examID: calEvent.exam._id }
        });
      } else if (calEvent.eventType === 'work-block') {
        if (calEvent.assessmentType === 'assignment') {
          this.$router.push({
            name: 'assignments-overview',
            params: { assignmentID: calEvent.assignment._id }
          });
        } else if (calEvent.assessmentType === 'exam') {
          this.$router.push({
            name: 'exams-overview',
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
    },
    formatDate (date) {
      return moment(date).format('M/D/YY h:mm A');
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
  height: 500px;
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
</style>
