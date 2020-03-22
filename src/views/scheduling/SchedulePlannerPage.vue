<template>
  <section class="section scheduler-planner-page">
    <h1 class="title">
      Course Schedule Planner
    </h1>

    <div class="columns">
      <div class="column">
        <div class="tabs">
          <ul>
            <li><a>Offered Courses</a></li>
            <li><a>Selected Sections</a></li>
          </ul>
        </div>

        <h2 class="subtitle">
          Offered Courses
        </h2>

        <div
          v-if="!selectedSubjectCode"
          class="panel"
        >
          <div class="panel-heading">
            <p class="panel-title">
              Subjects
            </p>
          </div>
          <div
            v-for="(fullTitle, subjectCode) in subjectCodes"
            :key="subjectCode"
            class="panel-block"
            @click="selectedSubjectCode = subjectCode"
          >
            <div class="vertical">
              <span>{{ fullTitle }}</span>
              <small>{{ subjectCode }}</small>
            </div>
          </div>
        </div>
        <div
          v-else
          class="panel"
        >
          <div class="panel-heading">
            <p class="panel-title">
              {{ selectedSubjectCode }} Courses

              <button
                class="button is-small is-pulled-right"
                @click="selectedSubjectCode = ''"
              >
                <span class="icon">
                  <i class="fas fa-chevron-left" />
                </span>
              </button>
            </p>
          </div>
          <div
            v-for="course in coursesGroupedBySubjectCode[selectedSubjectCode]"
            :key="course.number"
            class="panel-block"
          >
            <div class="is-flex course-summary">
              <div
                class="vertical"
                style="flex: 1"
              >
                <span>{{ course.title }}</span>
                <small>{{ selectedSubjectCode }}-{{ course.number }} <span class="tag is-small">{{ course.sections.length }} sections</span></small>
              </div>
              <span class="icon">
                <i class="fas fa-chevron-down" />
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="column">
        <FullCalendar
          :plugins="calendar.plugins"
          :header="calendar.header"
          :weekends="false"
          :column-header-format="calendar.columnHeaderFormat"
          slot-duration="01:00:00"
          :all-day-slot="false"
          min-time="08:00:00"
          max-time="22:00:00"
          default-view="timeGridWeek"
          height="auto"
        />
      </div>
    </div>
  </section>
</template>

<script>
import FullCalendar from '@fullcalendar/vue'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

import '@fullcalendar/core/main.css'
import '@fullcalendar/daygrid/main.css'
import '@fullcalendar/timegrid/main.css'

import courses from './202001.json'

export default {
  name: 'SchedulerPlannerPage',
  components: { FullCalendar },
  data () {
    return {
      calendar: {
        plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
        columnHeaderFormat: {
          weekday: 'long'
        },
        header: {
          left: '',
          center: '',
          right: ''
        }
      },
      subjectCodes: {
        CSCI: 'Computer Science',
        ITWS: 'Information Tech and Web Science'
      },
      selectedSubjectCode: ''
    }
  },
  computed: {
    coursesGroupedBySubjectCode () {
      const grouped = {}

      for (const course of courses) {
        if (!grouped[course.subjectCode]) grouped[course.subjectCode] = []

        grouped[course.subjectCode].push(course)
      }

      return grouped
    }
  }
}
</script>

<style lang="scss">
.scheduler-planner-page {
  .fc-today {
    background-color: inherit !important;
  }

  .fc-time-grid .fc-slats td {
    height: 3em;
    border-bottom: 0;
  }

  .vertical {
    display: flex;
    flex-direction: column;
  }

  .course-summary {
    width: 100%;
  }
}
</style>
