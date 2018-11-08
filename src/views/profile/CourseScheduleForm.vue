<template>
  <div class="course-schedule-form">
    <form
      class="box"
      @submit.prevent="save">
      <div class="field">
        <label
          for="pin"
          class="label">SIS PIN</label>
        <div class="control">
          <input
            id="pin"
            v-model="pin"
            type="password"
            class="input">
        </div>
      </div>

      <div class="field">
        <label
          class="label"
          for="crns">Directly Enter Your Course CRNs</label>
        <p class="help">These are found in SIS under 'View Weekly Schedule'.</p>
        <div class="control">
          <input
            id="crns"
            v-model="crns"
            class="input"
            name="crns"
            type="text"
            placeholder="123456, 654321, ...">
        </div>
      </div>

      <button class="button is-primary">{{ user.setup.personal_info ? 'Reset Schedule' : 'Save' }}</button>
    </form>

    <div class="course-list">
      <div
        v-for="c in courses"
        :key="c.listing_id"
        class="box">
        {{ c.longname }}
      </div>
    </div>
  </div>
</template>

<script>
import API from '../../api';

export default {
  name: 'CourseScheduleForm',
  data() {
    return {
      pin: '',
      crns: this.$store.state.auth.user.current_schedule
        .map(c => c.crn)
        .join(',')
    };
  },
  computed: {
    user() {
      return this.$store.state.auth.user;
    },
    courses() {
      return this.user.current_schedule;
    }
  },
  methods: {
    async save() {
      const request = await API.post('/setup/courseschedule', {
        pin: this.pin,
        crns: this.crns
      });

      this.$store.dispatch('SET_USER', request.data.updatedUser);
      this.$store.commit('ADD_NOTIFICATION', {
        type: 'success',
        description: 'Set course schedule!'
      });
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
