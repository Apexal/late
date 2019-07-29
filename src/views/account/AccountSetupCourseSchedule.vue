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
      <form
        class="box"
        @submit.prevent="importSchedule"
      >
        <details :open="courses.length === 0">
          <summary>
            <h2
              style="display: inline-block; cursor: pointer;"
              class="subtitle is-unselectable"
            >
              <b>Import Schedule from SIS</b>
            </h2>
          </summary>

          <form class="columns sis-method">
            <div class="column">
              <b-field>
                <b-input
                  id="rin"
                  v-model.trim="rin"
                  type="password"
                  size="is-small"
                  placeholder="Your RIN"
                  @change="saved = false"
                />
              </b-field>
            </div>

            <div class="column">
              <b-field>
                <b-input
                  id="pin"
                  v-model.trim="pin"
                  type="password"
                  size="is-small"
                  placeholder="Enter your SIS password."
                  @change="saved = false"
                />
              </b-field>
            </div>
            <div class="column is-narrow has-text-centered">
              <b-button
                size="is-small"
                type="is-primary"
                :loading="loading"
                :disabled="!canReset"
                @click="importSchedule"
              >
                {{ user.setup.profile ? "Import Schedule" : "Save" }}
              </b-button>
            </div>
          </form>
          <p class="help">
            Your RIN and password will be used to log into SIS, navigate to your
            current schedule page, and grab the CRNs of your courses. Your
            password and RIN is never saved or logged anywhere.
          </p>
        </details>
      </form>

      <hr>

      <p
        v-if="courses.length === 0"
        class="has-text-grey has-text-centered"
      >
        Set your courses above.
      </p>
      <template v-else>
        <div class="tabs">
          <ul>
            <li
              :class="{ 'is-active': tab === 'list' }"
              @click="tab = 'list'"
            >
              <a>List</a>
            </li>
            <li
              :class="{ 'is-active': tab === 'calendar' }"
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
      <router-link
        :to="{ name: 'setup-unavailability' }"
        class="button has-background-secondary is-pulled-right"
        :class="{ 'is-loading': loading }"
      >
        Save and Continue
      </router-link>
      <div class="buttons">
        <b-button
          type="is-dark"
          @click="startAddCustomCourse"
        >
          Add Course by CRN
        </b-button>
        <b-button type="is-dark">
          Add Custom Course
        </b-button>
      </div>
    </template>
  </div>
</template>

<script>
import CourseScheduleCalendar from '@/views/courses/components/CourseScheduleCalendar';
import AccountCourse from '@/views/account/components/AccountCourse';

import CustomCourseModal from './components/CustomCourseModal';

import accountMixin from '@/mixins/account';

export default {
  name: 'AccountSetupCourseSchedule',
  components: { AccountCourse, CustomCourseModal, CourseScheduleCalendar },
  mixins: [accountMixin],
  data () {
    return {
      tab: 'list',
      saved: false,
      loading: false,
      method: 'sis',
      rin: '',
      pin: '',
      openedCourseID: '',
      addingCustomCourse: false
    };
  },
  computed: {
    hasPersonalInfoSetup () {
      return this.$store.getters.userSetup.profile;
    },
    hasSelectedTerms () {
      return this.$store.getters.userSetup.terms;
    },
    canReset () {
      return !(this.pin.length === 0);
    },
    coursesWithoutOther () {
      return this.courses.filter(c => c.summary !== 'OTHER');
    },
    hiddenCourses () {
      return this.$store.state.schedule.courses.filter(c => c.hidden);
    }
  },
  methods: {
    gotoCourse (courseID) {
      this.tab = 'list';
      this.openedCourseID = courseID;
    },
    startAddCustomCourse () {
      this.promptRIN(rin => {
        this.promptPIN(pin => {
          this.rin = rin;
          this.pin = pin;
          this.addingCustomCourse = true;
        });
      });
    },
    addCustomCourse (courseData) {
      alert(courseData);
    },
    async removeCourse (courseID) {
      let removedCourse;
      try {
        removedCourse = await this.$store.dispatch('REMOVE_COURSE', courseID);
      } catch (e) {
        this.$toast.open({ message: e.request.data.message, type: 'is-danger' });
        return;
      }

      this.$toast.open({ message: `Removed ${removedCourse.title}!`, type: 'is-success' });
    },
    async importSchedule () {
      this.loading = true;

      let request;
      try {
        request = await this.$http.post('/account/courseschedule', {
          rin: this.rin,
          pin: this.pin
        });
      } catch (e) {
        this.loading = false;
        this.$toast.open({
          message: e.response.data.message,
          type: 'is-danger'
        });
        return;
      }

      this.$store.commit('SET_COURSES', request.data.courses);
      this.$store.commit('SET_USER', request.data.updatedUser);

      // Notify user of success
      this.$snackbar.open({
        message:
          'Your course schedule has been imported from SIS. Edit the courses below to customize titles, colors, and more.',
        type: 'is-primary',
        position: 'is-bottom',
        actionText: 'Next Step',
        duration: 5000,
        onAction: () => {
          this.$router.push({ name: 'setup-unavailability' });
        }
      });

      this.loading = false;
    }
  }
};
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
