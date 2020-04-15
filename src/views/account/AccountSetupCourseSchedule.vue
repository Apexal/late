<!--Account Setup: Course schedule setup page-->
<template>
  <div class="setup-course-schedule">
    <CustomCourseModal
      :open="addingCustomCourse"
      @add-custom-course="addCustomCourse"
      @close-modal="addingCustomCourse = false"
    />
    <template v-if="onBreak">
      <h2 class="subtitle has-text-centered">
        You will be able to set your new course schedule once break ends.
      </h2>
    </template>
    <template v-else-if="!hasPersonalInfoSetup || !hasSelectedTerms">
      <h2 class="subtitle has-text-centered">
        To setup your course schedule, you must first enter your RIN on the
        previous page.
      </h2>
    </template>
    <template v-else>
      <h2 class="is-size-4 integration-note">
        What is your
        <b>{{ currentTerm.name }}</b> course schedule?
      </h2>

      <p
        v-if="courses.length === 0"
        class="has-text-grey has-text-centered"
      >
        Set your courses below.
      </p>
      <template v-else>
        <div class="tabs">
          <ul>
            <li
              :class="{'is-active': tab === 'list'}"
              @click="tab = 'list'"
            >
              <a>List</a>
            </li>
            <li
              :class="{'is-active': tab === 'calendar'}"
              @click="
                tab = 'calendar';
                openedCourseID = '';
              "
            >
              <a>Calendar</a>
            </li>
          </ul>
        </div>

        <div
          v-if="tab === 'list'"
          class="course-list"
        >
          <h2 class="subtitle">
            Your Courses
            <small
              class="has-text-grey"
            >{{ coursesWithoutOther.length }} total</small>
            <span class="is-pulled-right">
              <button
                class="button"
                @click="colorsModalOpen = true"
              >
                <span class="icon"><i class="fas fa-palette" /></span>
                <span>Colors</span>
              </button>
              <b-modal
                :active.sync="colorsModalOpen"
                has-modal-card
                trap-focus
                aria-role="dialog"
                aria-modal
              >
                <div
                  class="modal-card"
                  style="width: auto"
                >
                  <header class="modal-card-head">
                    <p class="modal-card-title">Course Colors</p>
                  </header>
                  <section class="modal-card-body">
                    <p>{{ hoverCourseTitle || 'Hover over a color!' }}</p>
                    <input
                      v-for="course in courses"
                      :key="course.crn"
                      type="color"
                      :value="course.color"
                      @change="updateCourseColor(course, $event.target.value)"
                      @mouseover="hoverCourseTitle = course.title"
                      @mouseleave="hoverCourseTitle = null"
                    >
                    <br>
                    <input
                      type="text"
                      class="input"
                      :value="courses.map(c => c.color).join(',')"
                    >
                  </section>
                </div>
              </b-modal>

            </span>
          </h2>
          <AccountCourse
            v-for="c in coursesWithoutOther"
            :key="c.crn"
            :course="c"
            :highlighted="openedCourseID === c._id"
            @remove-course="removeCourse(c._id)"
          />

          <hr>
          <h2
            class="subtitle"
            title="These courses won't show up on any course list or on your schedule."
          >
            Hidden Courses
            <small
              class="has-text-grey"
            >{{ hiddenCourses.length }} total</small>
          </h2>
          <AccountCourse
            v-for="c in hiddenCourses"
            :key="c.crn"
            :course="c"
            @remove-course="removeCourse(c._id)"
          />
          <p
            v-if="hiddenCourses.length === 0"
            class="has-text-grey has-text-centered"
          >
            You have not hidden any courses.
          </p>
        </div>
        <CourseScheduleCalendar
          v-else-if="tab === 'calendar'"
          @goto-course="gotoCourse"
        />
      </template>
      <hr>
      <div class="columns has-text-centered-mobile">
        <div class="column buttons">
          <b-button
            type="is-dark"
            @click="startAddCourseByCRN"
          >
            Add Course by CRN
          </b-button>
          <b-button
            type="is-dark"
            title="Coming soon..."
            disabled
          >
            Add Custom Course
          </b-button>
        </div>
        <div class="column is-narrow-desktop">
          <div class="buttons">
            <b-button
              type="is-dark"
              @click="startImportSchedule"
            >
              <i class="fas fa-cloud-download-alt" />
              Import from SIS
            </b-button>
            <router-link
              :to="{name: 'setup-unavailability'}"
              class="button is-primary"
              :class="{'is-loading': loading}"
            >
              Continue
            </router-link>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import CourseScheduleCalendar from '@/views/courses/components/CourseScheduleCalendar'
import AccountCourse from '@/views/account/components/AccountCourse'

import CustomCourseModal from './components/CustomCourseModal'

import accountMixin from '@/mixins/account'

export default {
  name: 'AccountSetupCourseSchedule',
  components: { AccountCourse, CustomCourseModal, CourseScheduleCalendar },
  mixins: [accountMixin],
  data () {
    return {
      tab: 'list',
      saved: false,
      loading: false,
      colorsModalOpen: false,
      openedCourseID: '',
      hoverCourseTitle: null,
      addingCustomCourse: false
    }
  },
  computed: {
    hasPersonalInfoSetup () {
      return this.$store.getters.userSetup.profile
    },
    hasSelectedTerms () {
      return this.$store.getters.userSetup.terms
    },
    canReset () {
      return !(this.pin.length === 0)
    },
    coursesWithoutOther () {
      return this.courses.filter(c => c.summary !== 'OTHER')
    },
    hiddenCourses () {
      return this.$store.state.schedule.courses.filter(c => c.hidden)
    }
  },
  methods: {
    gotoCourse (courseID) {
      this.tab = 'list'
      this.openedCourseID = courseID
    },
    startAddCustomCourse () {
      // if (this.rin && this.pin) {
      //   this.addingCustomCourse = true
      // } else {
      //   this.promptRIN(rin => {
      //     this.promptPIN(pin => {
      //       this.rin = rin
      //       this.pin = pin
      //       this.addingCustomCourse = true
      //     })
      //   })
      // }
    },
    startAddCourseByCRN () {
      this.promptCredentials((rin, pin) => {
        this.$buefy.dialog.prompt({
          message: 'What is the course <b>CRN</b>?',
          inputAttrs: {
            placeholder: 'From YACS or SIS'
          },
          onConfirm: crn => this.addCourseByCRN(rin, pin, crn.trim())
        })
      })
    },
    async addCourseByCRN (rin, pin, crn) {
      let request
      try {
        request = await this.$http.put(`/account/courseschedule/${crn}`, {
          rin,
          pin
        })
      } catch (e) {
        return this.showError(e.response.data.message)
      }

      this.$store.commit('SET_CREDENTIALS', { rin, pin })

      const newCourse = request.data.course
      this.$buefy.toast.open({ message: `Grabbed course ${newCourse.title} from SIS!` })
      this.$store.commit('ADD_COURSE', newCourse)
    },
    addCustomCourse (courseData) {
      // alert(courseData)
    },
    async removeCourse (courseID) {
      let removedCourse
      try {
        removedCourse = await this.$store.dispatch('REMOVE_COURSE', courseID)
      } catch (e) {
        return this.showError(e.response.data.message)
      }

      this.$buefy.toast.open({ message: `Removed ${removedCourse.title}!`, type: 'is-success' })
    },
    startImportSchedule () {
      this.promptCredentials(this.importSchedule)
    },
    async importSchedule (rin, pin) {
      this.loading = true

      let request
      try {
        request = await this.$http.post('/account/courseschedule', {
          rin,
          pin
        })
      } catch (e) {
        this.loading = false
        return this.showError(e.response.data.message)
      }

      this.$store.commit('SET_COURSES', request.data.courses)
      this.$store.commit('SET_USER', request.data.updatedUser)

      this.$store.commit('SET_CREDENTIALS', { rin, pin })

      // Notify user of success
      this.$buefy.snackbar.open({
        message:
          'Your course schedule has been imported from SIS. Edit the courses below to customize titles, colors, and more.',
        type: 'is-primary',
        position: 'is-bottom',
        actionText: 'Next Step',
        duration: 7000,
        onAction: () => {
          this.$router.push({ name: 'setup-unavailability' })
        }
      })

      this.loading = false
    },
    async updateCourseColor (course, color) {
      let updatedCourse
      try {
        updatedCourse = await this.$store.dispatch(
          'UPDATE_COURSE',
          {
            courseID: course.id,
            updates: { color }
          }
        )
      } catch (e) {
        const message = e.response ? e.response.data.message : e.message
        this.showError(message)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.control {
  margin-top: 10px;
}

#pin {
  margin-left: 5px;
  margin-right: 5px;
  max-width: 80%;
}
</style>
