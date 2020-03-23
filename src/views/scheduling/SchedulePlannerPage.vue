<template>
  <section class="section scheduler-planner-page">
    <h1 class="title">
      Course Schedule Planner
    </h1>

    <div class="columns">
      <div class="column is-half is-full-tablet">
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
          v-if="viewing === 'offered'"
          class="offered-courses"
        >
          <div
            v-if="!selectedSubjectCode"
            class="panel"
          >
            <div class="panel-heading">
              <p class="panel-title">
                Subjects
              </p>
            </div>
            <div class="scroll">
              <div
                v-for="(fullTitle, subjectCode) in subjectCodes"
                :key="subjectCode"
                class="panel-block subject-code-block"
                :class="{'is-selected': subjectHasSelectedSections(subjectCode)}"
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
            <div class="panel-block">
              <p class="control has-icons-left">
                <input
                  v-model.trim="courseSearch"
                  class="input"
                  type="text"
                  placeholder="Search courses"
                >
                <span class="icon is-left">
                  <i
                    class="fas fa-search"
                    aria-hidden="true"
                  />
                </span>
              </p>
            </div>
            <div class="scroll">
              <div
                v-if="selectedSubjectCourses.length === 0"
                class="panel-block has-text-grey"
              >
                No courses found matching your search!
              </div>
              <div
                v-for="course in selectedSubjectCourses"
                :key="course.number"
                class="panel-block course-block"
                :class="{'is-selected': courseHasSelectedSections(course)}"
              >
                <div
                  class="is-flex course-summary"
                  @click="selectedCourseNumber = selectedCourseNumber === course.number ? '' : course.number"
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
                      <!-- <span class="tag is-small is-danger">conflicts</span> -->
                      </div>
                    </small>
                  </div>
                  <span
                    class="icon"
                    @click.stop="addCourseSections(course)"
                  >
                    <i class="fas fa-folder-plus" />
                  </span>
                  <span class="icon">
                    <i class="fas fa-chevron-down" />
                  </span>
                </div>
                <div
                  v-if="selectedCourseNumber === course.number"
                  class="course-details"
                >
                  <p><em>Course description here...</em></p>
                  <table class="table is-narrow is-hoverable is-fullwidth">
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
        </div>
        <div v-else-if="viewing === 'selected'">
          <div class="tags">
            <span
              v-for="crn in selectedSchedule"
              :key="crn"
              class="tag is-dark"
            >{{ crn }}</span>
          </div>
        </div>
      </div>

      <div class="column">
        <div class="buttons">
          <button
            class="button"
            :disabled="selectedScheduleIndex <= 0"
            @click="selectedScheduleIndex -= 1"
          >
            <span class="icon">
              <i class="fas fa-chevron-left" />
            </span>
          </button>
          <h1>{{ selectedScheduleIndex + 1 }} / {{ possibleScheduleCount }}</h1>

          <button
            class="button"
            :disabled="selectedScheduleIndex >= possibleScheduleCount - 1"
            @click="selectedScheduleIndex += 1"
          >
            <span class="icon">
              <i class="fas fa-chevron-right" />
            </span>
          </button>
        </div>
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
          :events="selectedScheduleEvents"
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
      selectedCRNs: [],
      selectedScheduleIndex: 0,
      courseSearch: ''
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
    selectedSchedulePeriods () {
      return this.selectedSections.filter(section => this.selectedSchedule.includes(section.crn)).map(section => section.periods).flat()
    },
    selectedScheduleEvents () {
      return this.selectedSchedulePeriods.map(this.mapPeriodToEvent).concat(this.hoveredEvents)
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
    },
    groupedCRNs () {
      const grouped = {}
      for (const section of this.selectedSections) {
        const key = section.courseSubjectCode + section.courseNumber
        if (!grouped[key]) grouped[key] = []
        grouped[key].push(section.crn)
      }
      return grouped
    },
    possibleScheduleCount () {
      return Object.values(this.groupedCRNs).reduce((acc, arr) => acc * arr.length, 1)
    },
    possibleSchedules () {
      /* God bless https://stackoverflow.com/questions/12303989/cartesian-product-of-multiple-arrays-in-javascript/57597533#57597533 */

      const vals = Object.values(this.groupedCRNs)
      if (vals.length === 0) return []
      return vals.reduce((acc, curr) => acc.flatMap(c => curr.map(n => [].concat(c, n))))
    },
    selectedSchedule () {
      return this.possibleSchedules[this.selectedScheduleIndex]
    },
    selectedSubjectCourses () {
      if (this.courseSearch === '') {
        return this.coursesGroupedBySubjectCode[this.selectedSubjectCode]
      }

      return this.coursesGroupedBySubjectCode[this.selectedSubjectCode].filter(course => course.title.toLowerCase().includes(this.courseSearch.toLowerCase()))
    }
  },
  watch: {
    possibleSchedules (newSchedules) {
      if (this.selectedScheduleIndex >= newSchedules.length) { this.selectedScheduleIndex = Math.max(newSchedules.length - 1, 0) }
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
    subjectHasSelectedSections (subjectCode) {
      return this.selectedSections.some(section => section.courseSubjectCode === subjectCode)
    },
    courseHasSelectedSections (course) {
      return course.sections.some(section => this.selectedSections.includes(section))
    },
    addCourseSections (course) {
      this.selectedCRNs = [...new Set(this.selectedCRNs.concat(course.sections.map(section => section.crn)))]
    },
    mapPeriodToEvent (period) {
      return {
        title: period.courseTitle + ' ' + period.periodType,
        startTime: period.startTime,
        endTime: period.endTime,
        daysOfWeek: period.days,
        crn: period.crn,
        color: 'white',
        classNames: 'has-background-primary'
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

  .course-summary, .subject-code-block {
    width: 100%;
    cursor: pointer;
    align-items: center;
  }

  span.icon {
    font-size: 1.2em;
  }

  .subject-code-block {
    span.icon {
      transition: 0.3s transform;
    }
    &:hover {
      span.icon {
        transform: translateX(5px);
      }
    }
  }

  .course-block {
    display: block;
  }

  .scroll {
    max-height: 500px;
    overflow-y: auto;
    overflow-x: hidden;

    // table {
    //   overflow-x: auto;
    // }
  }

  .panel-block.is-selected {
    border-left: 4px solid #70cad1;
  }
}
</style>
