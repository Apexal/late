<template>
  <div class="setup-course-schedule">
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

          <div class="sis-method">
            <div class="field">
              <div class="control">
                <label
                  for="pin"
                  class="label is-pulled-left"
                >SIS PIN:</label>
                <input
                  id="pin"
                  v-model.trim="pin"
                  type="password"
                  class="input is-small"
                  placeholder="Enter your SIS password."
                  @change="saved = false"
                >
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
            </div>
            <p class="help">
              Your password will be used to log into SIS, navigate to your
              current schedule page, and grab the CRNs of your courses. Your
              password is never saved or logged anywhere.
            </p>
          </div>
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
        to="/account/unavailability"
        class="button is-primary"
        :class="{ 'is-loading': loading }"
      >
        Save and Continue
      </router-link>
    </template>
  </div>
</template>

<script>
import CourseScheduleCalendar from '@/views/components/account/CourseScheduleCalendar';
import AccountCourse from '@/views/components/account/AccountCourse';

export default {
  name: 'AccountSetupCourseSchedule',
  components: { AccountCourse, CourseScheduleCalendar },
  data () {
    return {
      tab: 'list',
      saved: false,
      loading: false,
      method: 'sis',
      pin: '',
      openedCourseID: ''
    };
  },
  computed: {
    hasPersonalInfoSetup () {
      return this.$store.getters.userSetup.profile;
    },
    hasSelectedTerms () {
      return this.$store.getters.userSetup.terms;
    },
    currentTerm () {
      return this.$store.getters.currentTerm;
    },
    onBreak () {
      return this.$store.getters.onBreak;
    },
    canReset () {
      return !(this.pin.length === 0);
    },
    user () {
      return this.$store.state.auth.user;
    },
    courses () {
      return this.$store.getters.current_courses;
    },
    coursesWithoutOther () {
      return this.courses.filter(c => c.summary !== 'OTHER');
    },
    hiddenCourses () {
      return this.$store.getters.current_courses_all.filter(c => c.hidden);
    }
  },
  methods: {
    gotoCourse (courseID) {
      this.tab = 'list';
      this.openedCourseID = courseID;
    },
    async importSchedule () {
      this.loading = true;

      let request;
      try {
        request = await this.$http.post('/account/courseschedule', {
          pin: this.pin
        });
      } catch (e) {
        this.loading = false;
        this.$toasted.error(e.response.data.message);
        return;
      }

      this.$store.commit('SET_COURSES', request.data.courses);
      this.$store.commit('SET_USER', request.data.updatedUser);

      // Notify user of success
      this.$toasted.info(
        'Your course schedule has been imported from SIS. Edit the courses below to customize titles, colors, and more.',
        {
          action: {
            text: 'Next Step',
            push: {
              name: 'setup-unavailability'
            }
          }
        }
      );

      // this.saved = true;
      this.loading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
#pin {
  margin-left: 5px;
  margin-right: 5px;
  max-width: 80%;
}
</style>
