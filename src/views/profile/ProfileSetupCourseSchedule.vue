<template>
  <div class="setup-course-schedule">
    <template v-if="onBreak">
      <h2
        class="subtitle has-text-centered"
      >
        You will be able to set your new course schedule once break ends.
      </h2>
    </template>
    <template v-else-if="!hasPersonalInfoSetup">
      <h2
        class="subtitle has-text-centered"
      >
        To setup your course schedule, you must first enter your RIN on the previous page.
      </h2>
    </template>
    <template v-else>
      <h2 class="is-size-4 integration-note">
        What is your
        <b>{{ currentTerm.name }}</b> course schedule?
      </h2>
      <form
        class="box"
        @submit.prevent="save"
      >
        <details :open="crns.length === 0">
          <summary>
            <h2
              style="display: inline-block; cursor: pointer;"
              class="subtitle is-unselectable"
            >
              <b>Import Schedule from SIS</b>
            </h2>
          </summary>

          <div class="columns">
            <div class="field column is-narrow">
              <label
                for="method"
                class="label"
              >Method</label>
              <div class="control">
                <select
                  id="method"
                  v-model="method"
                  name="method"
                  class="control"
                  disabled
                >
                  <option value="sis">
                    SIS
                  </option>
                  <!--<option value="crn">
                    CRNs
                  </option>
                  <option value="ical">
                    iCal
                  </option>-->
                </select>
              </div>
            </div>

            <div
              v-if="method === 'sis'"
              class="sis-method column"
            >
              <div class="field">
                <label
                  for="pin"
                  class="label"
                >SIS PIN</label>
                <p
                  class="help"
                >
                  Your password will be used to log into SIS, navigate to your current schedule page, and grab the CRNs of your courses. Your password is never saved or logged anywhere.
                </p>
                <div class="control">
                  <input
                    id="pin"
                    v-model.trim="pin"
                    type="password"
                    class="input is-small"
                    placeholder="Enter your SIS password."
                    @change="saved = false"
                  >
                </div>
              </div>
            </div>
            <div
              v-else-if="method === 'crn'"
              class="crn-method column"
            >
              <div class="field">
                <label
                  class="label"
                  for="crns"
                >Directly Enter Your Course CRNs</label>
                <p class="help">
                  These are found in SIS under 'View Weekly Schedule'.
                </p>
                <div class="control">
                  <input
                    id="crns"
                    v-model.trim="crns"
                    class="input"
                    name="crns"
                    type="text"
                    placeholder="123456, 654321, ..."
                    @change="saved = false"
                  >
                </div>
              </div>
            </div>
            <div
              v-else-if="method === 'ical'"
              class="ical-method column"
            >
              <div class="field">
                <label
                  for="ical-file"
                  class="label"
                >iCal File from YACS</label>
                <div class="control">
                  <input
                    id="ical-file"
                    type="file"
                    class="input"
                    accept=".ics"
                    @change="iCalFileChange($event.target.files[0])"
                  >
                </div>
              </div>
            </div>
          </div>

          <button
            class="button is-small is-primary"
            :class="{'is-loading': loading}"
            :disabled="!canReset"
          >
            {{ user.setup.personal_info ? 'Import Schedule' : 'Save' }}
          </button>
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
              :class="{'is-active': tab === 'list'}"
              @click="tab = 'list'; destroyCalendar();"
            >
              <a>List</a>
            </li>
            <li
              :class="{'is-active': tab === 'calendar'}"
              @click="tab = 'calendar'"
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
            <small class="has-text-grey">{{ coursesWithoutOther.length }} total</small>
          </h2>
          <ProfileCourse
            v-for="c in coursesWithoutOther"
            :key="c.crn"
            :course="c"
            @update-course="updatedCourse"
          />
        </div>
        <div
          v-else-if="tab === 'calendar'"
          class="course-calendar"
        >
          <p class="has-text-centered has-text-grey">
            Coming soon...
          </p>
        </div>

        <hr>
        <h2
          class="subtitle"
          title="These courses won't show up on any course list or on your schedule."
        >
          Hidden Courses
          <small class="has-text-grey">{{ hiddenCourses.length }} total</small>
        </h2>
        <ProfileCourse
          v-for="c in hiddenCourses"
          :key="c.crn"
          :course="c"
          @update-course="updatedCourse"
        />
        <p
          v-if="hiddenCourses.length === 0"
          class="has-text-grey has-text-centered"
        >
          You have not hidden any courses.
        </p>
      </template>
      <hr>
      <router-link
        to="/profile/unavailability"
        class="button is-primary"
        :class="{'is-loading': loading}"
      >
        Save and Continue
      </router-link>
    </template>
  </div>
</template>

<script>
import { FullCalendar } from 'vue-full-calendar';
import 'fullcalendar/dist/fullcalendar.css';

import ProfileCourse from '@/views/components/profile/ProfileCourse';

export default {
  name: 'ProfileSetupCourseSchedule',
  components: { ProfileCourse, FullCalendar },
  data () {
    return {
      tab: 'list',
      saved: false,
      loading: false,
      method: 'sis',
      pin: '',
      crns: '',
      iCalFile: null,
      calendar: {
        allDaySlot: false,
        minTime: '08:00:00',
        maxTime: '20:00:00',
        header: {
          left: '',
          center: '',
          right: ''
        }
      }
    };
  },
  computed: {
    hasPersonalInfoSetup () {
      return this.$store.getters.userSetup.personal_info;
    },
    currentTerm () {
      return this.$store.getters.currentTerm;
    },
    onBreak () {
      return this.$store.getters.onBreak;
    },
    canReset () {
      return !(this.pin.length === 0 && this.crns.length === 0);
    },
    user () {
      return this.$store.state.auth.user;
    },
    courses () {
      return this.$store.getters.current_schedule;
    },
    coursesWithoutOther () {
      return this.courses.filter(c => c.summary !== 'OTHER');
    },
    hiddenCourses () {
      return this.$store.getters.current_schedule_all.filter(c => c.summary !== 'OTHER' && c.hidden);
    },
    courseEvents () {
      return this.$store.getters.getCourseScheduleAsEvents;
    }
  },
  created () {
    this.crns = this.$store.getters.current_schedule_all.map(c => c.crn).join(',');
  },
  methods: {
    async iCalFileChange (file) {
      this.iCalFile = file;
    },
    destroyCalendar () {
      // this.$refs.calendar.fireMethod('destroy');
    },
    async updatedCourse (updatedCourse) {
      this.loading = true;

      await this.$store.dispatch('UPDATE_COURSE', updatedCourse);

      this.$toasted.show(`'${updatedCourse.longname}' has been updated.`);

      // this.saved = true;
      this.loading = false;
    },
    async save () {
      this.loading = true;

      let data = {};
      if (this.method === 'sis') {
        data.pin = this.pin;
      } else if (this.method === 'crn') {
        data.crns = this.crns;
      } else if (this.method === 'ical') {
        data = new FormData();
        data.append('ical-file', this.iCalFile, this.iCalFile.name);
      } else {
        this.$toasted.error('Unknown method...');
        this.loading = false;
        return;
      }

      let request;
      try {
        request = await this.$http.post('/setup/courseschedule', data, {
          params: { method: this.method }
        });
      } catch (e) {
        this.loading = false;
        this.$toasted.error(e.response.data.message);
        return;
      }

      this.$store.dispatch('SET_USER', request.data.updatedUser);

      // Notify user of success
      this.$toasted.info(
        'Your course schedule has been compiled. Edit the courses to your liking below.',
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
.integration-note {
  text-align: center;
  margin: 1.5em 0em 1em 0em;
}
</style>
