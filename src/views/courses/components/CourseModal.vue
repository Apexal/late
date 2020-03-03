<!--Modal: Course overview modal-->
<template>
  <b-modal
    class="course-modal"
    :active="open"
    @close="$store.commit('CLOSE_COURSE_MODAL')"
  >
    <div
      class="card"
    >
      <div class="card-content">
        <router-link
          title="Edit course info and links"
          :to="{name: 'setup-course-schedule'}"
          class="button is-small margin-left is-pulled-right"
        >
          <i class="fas fa-pencil-alt" />
        </router-link>
        <div
          class="tag section-tag is-pulled-right"
          :style="{'background-color': course.color}"
          :title="'You are in Section ' + course.sectionId"
        >
          Section {{ course.sectionId }}
        </div>
        <h2
          class="subtitle course-title"
          :title="course.originalTitle + ' - ' + course.summary + ' - ' + course.sectionId"
        >
          {{ course.title }}
          <br>
          <small class="has-text-grey course-summary">{{ course.summary }}</small>
        </h2>

        <div class="tabs is-centered">
          <ul>
            <li
              :class="{'is-active': activeTab === 'CourseModalUpcoming'}"
              @click="activeTab = 'CourseModalUpcoming'"
            >
              <a>
                <span class="icon is-small">
                  <i
                    class="fas fa-clipboard-list"
                    aria-hidden="true"
                  />
                </span>
                <span>Upcoming</span>
                <span class="tag">{{ upcomingAssessments.length }}</span>
              </a>
            </li>
            <li
              v-if="course.periods"
              :class="{'is-active': activeTab === 'CourseModalSchedule'}"
              @click="activeTab = 'CourseModalSchedule'"
            >
              <a>
                <span class="icon is-small">
                  <i
                    class="far fa-clock"
                    aria-hidden="true"
                  />
                </span>
                <span>Schedule</span>
                <span class="tag">{{ course.periods.length }}</span>
              </a>
            </li>
            <li
              :class="{'is-active': activeTab === 'CourseModalLinks'}"
              @click="activeTab = 'CourseModalLinks'"
            >
              <a>
                <span class="icon is-small">
                  <i
                    class="fas fa-link"
                    aria-hidden="true"
                  />
                </span>
                <span>Links</span>
                <span class="tag">{{ links.length }}</span>
              </a>
            </li>
          </ul>
        </div>

        <Component
          :is="activeTab"
          :course="course"
          :upcoming-assessments="upcomingAssessments"
          @add-assessment="addAssessment"
        />
      </div>
    </div>
  </b-modal>
</template>

<script>
import moment from 'moment'

// Tabs
import CourseModalUpcoming from './CourseModalUpcoming'
import CourseModalSchedule from './CourseModalSchedule'
import CourseModalLinks from './CourseModalLinks'

export default {
  name: 'CourseModal',
  components: { CourseModalUpcoming, CourseModalSchedule, CourseModalLinks },
  props: {
    open: {
      type: Boolean,
      required: true
    },
    course: { type: Object, required: true }
  },
  data () {
    return {
      activeTab: 'CourseModalUpcoming'
    }
  },
  computed: {
    upcomingAssessments () {
      const limit = moment().add(2, 'week')
      const assessments = this.$store.state.assessments.upcomingAssessments.filter(
        assessment =>
          moment(assessment.dueDate || assessment.date).isBefore(limit) &&
          assessment.courseCRN === this.course.crn
      )
      return assessments
    },
    links () {
      return this.course.links || []
    }
  },
  methods: {
    addAssessment (assessmentType) {
      this.$store.commit('CLOSE_COURSE_MODAL')
      this.$store.commit(
        'SET_ADD_' + assessmentType.toUpperCase() + '_MODAL_VALUES',
        {
          courseCRN: this.course.crn
        }
      )

      this.$store.commit(
        'TOGGLE_ADD_' + assessmentType.toUpperCase() + '_MODAL'
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.card {
  border-radius: 6px;
}

div.tabs.is-centered {
  margin-bottom: 12px;
}
h2.subtitle.course-title {
  margin-bottom: 0;
}

.tag {
  margin-left: 4px;
}
.section-tag {
  height: 27px;
  border-radius: 4px 0px 0px 4px;
  color: white;
}
.button.is-small {
  border-radius: 0px 4px 4px 0px;
}
</style>
