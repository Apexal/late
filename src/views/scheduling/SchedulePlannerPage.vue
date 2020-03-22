<template>
  <section class="section scheduler-planner-page">
    <h1 class="title">
      Course Schedule Planner
    </h1>

    <div class="columns">
      <div class="column">
        <div class="tabs">
          <ul>
            <li
              :class="{'is-active': viewing === 'offered'}"
              @click="viewing = 'offered'"
            >
              <a>Offered Courses</a>
            </li>
            <li
              :class="{'is-active': viewing === 'selected'}"
              @click="viewing = 'selected'"
            >
              <a>Selected Sections</a>
            </li>
          </ul>
        </div>

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
            <div
              class="vertical"
              style="flex: 1"
            >
              <span>{{ fullTitle }}</span>
              <small>{{ subjectCode }}</small>
            </div>
            <span class="icon">
              <i class="fas fa-chevron-right" />
            </span>
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
                <span>Subjects</span>
              </button>
            </p>
          </div>
          <div
            v-for="course in coursesGroupedBySubjectCode[selectedSubjectCode]"
            :key="course.number"
            class="panel-block course-block"
          >
            <div
              class="is-flex course-summary"
              @click="selectedCourseNumber = selectedCourseNumber === '' ? course.number : ''"
            >
              <div
                class="vertical"
                style="flex: 1"
              >
                <strong>{{ course.title }}</strong>
                <small>
                  {{ selectedSubjectCode }}-{{ course.number }}
                  <div
                    class="tags"
                    style="display: inline-block"
                  >
                    <span class="tag is-small">{{ course.sections.length }} sections</span>
                    <span class="tag is-smal">{{ totalCredits(course) }} credits</span>
                  </div>
                </small>
              </div>
              <span class="icon">
                <i class="fas fa-chevron-down" />
              </span>
            </div>
            <div
              v-if="selectedCourseNumber === course.number"
              class="course-details"
            >
              <p>Course description here...</p>
              <table class="table is-narrow is-fullwidth">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>CRN</th>
                    <th>Instructors</th>
                    <th>Mon</th>
                    <th>Tue</th>
                    <th>Wed</th>
                    <th>Thu</th>
                    <th>Fri</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="section in course.sections"
                    :key="section.crn"
                    :class="{'is-selected': selectedCRNs.includes(section.crn)}"
                    @mouseover="hoveredCRN = section.crn"
                    @mouseout="hoveredCRN = ''"
                    @click="toggleCRN(section.crn)"
                  >
                    <td>{{ section.sectionId }}</td>
                    <td>{{ section.crn }}</td>
                    <td>{{ section.instructors.join(', ') }}</td>
                    <td />
                    <td />
                    <td />
                    <td />
                    <td />
                  </tr>
                </tbody>
              </table>
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
          :events="periodEvents"
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
      viewing: 'offered',
      subjectCodes: {
        CSCI: 'Computer Science',
        ITWS: 'Information Tech and Web Science'
      },
      selectedSubjectCode: '',
      selectedCourseNumber: '',
      hoveredCRN: '',
      selectedCRNs: []
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
    },
    selectedSections () {
      return courses.map(course => course.sections).flat().filter(section => this.selectedCRNs.includes(section.crn))
    },
    selectedPeriods () {
      return this.selectedSections.map(section => section.periods).flat()
    },
    periodEvents () {
      return this.selectedPeriods.map(this.mapPeriodToEvent).concat(this.hoveredEvents)
    },
    hoveredEvents () {
      if (!this.hoveredCRN || this.selectedCRNs.includes(this.hoveredCRN)) return []
      return courses.map(course => course.sections)
        .flat()
        .find(section => section.crn === this.hoveredCRN)
        .periods
        .map(period => ({
          ...this.mapPeriodToEvent(period),
          color: 'lightblue'
        }))
    }
  },
  methods: {
    totalCredits (course) {
      return [...new Set(course.sections.map(section => section.credits))].join(' or ')
    },
    toggleCRN (crn) {
      if (this.selectedCRNs.includes(crn)) {
        this.selectedCRNs = this.selectedCRNs.filter(oldCRN => oldCRN !== crn)
      } else {
        this.selectedCRNs.push(crn)
      }
    },
    mapPeriodToEvent (period) {
      return {
        title: period.courseTitle + ' ' + period.periodType,
        startTime: period.startTime,
        endTime: period.endTime,
        daysOfWeek: period.days,
        crn: period.crn
      }
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

  .course-block {
    display: block;
  }
}
</style>
