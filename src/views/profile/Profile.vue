<template>
  <div id="profile">
    <section class="section">
      <h1 class="title">Your Profile</h1>


      <div
        class="steps"
      >
        <router-link
          v-for="s in setups"
          :key="s.component"
          :to="{ path: s.link }"
          tag="div"
          class="step-item"
          :class="{ 'is-completed': user.setup[s.setup_check] }"
        >
          <div class="step-marker">
            <span class="icon">
              <i
                v-if="user.setup[s.setup_check]"
                class="fas fa-check"
              />
              <i
                v-else
                class="fas fa-times"
              />
            </span>
          </div>

          <div class="step-details">
            <p class="step-title">{{ s.label }}</p>
          </div>
        </router-link>
      </div>
      <keep-alive>
        <transition
          name="slide-left"
          mode="out-in"
        >
          <router-view class="child-view" />
        </transition>
      </keep-alive>
    </section>
  </div>
</template>

<script>
import 'bulma-steps';

export default {
  name: 'Profile',
  data () {
    return {
      setups: [
        { label: 'Personal Info', link: '/profile/personalinfo', setup_check: 'personal_info' },
        { label: 'Course Schedule', link: '/profile/courseschedule', setup_check: 'course_schedule' },
        { label: 'Study/Work Unavailability', link: '/profile/unavailability', setup_check: 'unavailability' },
        { label: 'Integrations', link: '/profile/integrations', setup_check: 'integrations' }
      ]
    };
  },
  computed: {
    user () { return this.$store.state.auth.user; }
  }
};
</script>

<style lang='scss' scoped>
/*Makes the marker appear more clickable to the user*/
.step-marker:hover {
  cursor: pointer;
}
</style>
