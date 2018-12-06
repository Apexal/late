<template>
  <div class="course-schedule-form">
    <h2 class="is-size-4 integration-note">What is your current semester schedule?</h2>
    <form
      class="box"
      @submit.prevent="save"
    >
      <details :open="crns.length === 0">
        <summary>
          <h2
            style="display: inline-block"
            class="subtitle is-unselectable"
          >Automatically Set Your Course Schedule</h2>
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
              >
                <option value="sis">SIS</option>
                <option value="crn">CRNs</option>
              </select>
            </div>
          </div>

          <div
            v-if="method == 'sis'"
            class="sis-method column"
          >
            <div class="field">
              <label
                for="pin"
                class="label"
              >SIS PIN</label>
              <p
                class="help"
              >Your password will be used to log into SIS, navigate to your current schedule page, and grab the CRNs of your courses. Your password is never saved or logged anywhere.</p>
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
            v-else-if="method == 'crn'"
            class="crn-method column"
          >
            <div class="field">
              <label
                class="label"
                for="crns"
              >Directly Enter Your Course CRNs</label>
              <p class="help">These are found in SIS under 'View Weekly Schedule'.</p>
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
        </div>

        <button
          class="button is-small is-warning"
          :class="{'is-loading': loading}"
          :disabled="!canReset"
        >{{ user.setup.personal_info ? 'Reset Schedule' : 'Save' }}</button>
      </details>
    </form>

    <hr>

    <p
      v-if="courses.length === 0"
      class="has-text-grey has-text-centered"
    >Set your courses above.</p>
    <template v-else>
      <h2 class="subtitle">Your Courses</h2>
      <div class="columns is-multiline course-list">
        <div
          v-for="c in courses"
          :key="c.crn"
          class="column is-half"
        >
          <Course
            :course="c"
            @update-course="updatedCourse"
          />
        </div>
      </div>
    </template>
    <hr>
    <router-link
      to="/profile/unavailability"
      class="button is-primary"
    >Save</router-link>
  </div>
</template>

<script>
import Course from '@/components/profile/Course';

export default {
  name: 'CourseScheduleForm',
  components: { Course },
  data () {
    return {
      saved: false,
      loading: false,
      method: 'sis',
      pin: '',
      crns: this.$store.state.auth.user.current_schedule
        .map(c => c.crn)
        .join(',')
    };
  },
  computed: {
    canReset () {
      return !(this.pin.length === 0 && this.crns.length === 0);
    },
    user () {
      return this.$store.state.auth.user;
    },
    courses () {
      return this.user.current_schedule;
    }
  },
  methods: {
    async updatedCourse (updatedCourse) {
      this.loading = true;

      await this.$store.dispatch('UPDATE_COURSE', updatedCourse);

      this.$toasted.show(`'${updatedCourse.longname}' has been updated.`);

      // this.saved = true;
      this.loading = false;
    },
    async save () {
      this.loading = true;

      let request;
      try {
        request = await this.$http.post('/setup/courseschedule', {
          pin: this.pin,
          crns: this.crns
        });
      } catch (e) {
        this.loading = false;
        return this.$toasted.error(e.response.data.message);
      }

      this.$store.dispatch('SET_USER', request.data.updatedUser);

      // Notify user of success
      this.$toasted.info('Your course schedule has been compiled.', {
        action: {
          text: 'Next Step',
          push: {
            name: 'unavailability'
          }
        }
      });

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
