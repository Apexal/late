<template>
  <div id="profile">
    <section class="section">
      <h1 class="title">
        Your Account
      </h1>

      <div class="steps">
        <router-link
          v-for="s in setups"
          :key="s.component"
          :to="{ path: s.link }"
          tag="div"
          class="step-item"
          :class="{ 'is-completed': userSetup[s.setup_check] }"
        >
          <div class="step-marker">
            <span class="icon">
              <i
                v-if="userSetup[s.setup_check]"
                class="fas fa-check"
              />
              <i
                v-else
                class="fas fa-times"
              />
            </span>
          </div>

          <div class="step-details">
            <p class="step-title">
              {{ s.label }}
            </p>
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
        {
          label: 'Account Info',
          link: '/profile/personalinfo',
          setup_check: 'personal_info'
        },
        {
          label: 'Course Schedule',
          link: '/profile/courseschedule',
          setup_check: 'course_schedule'
        },
        {
          label: 'Study/Work Unavailability',
          link: '/profile/unavailability',
          setup_check: 'unavailability'
        },
        {
          label: 'Notifications',
          link: '/profile/integrations',
          setup_check: 'integrations'
        },
        {
          label: 'Google Calendar',
          link: '/profile/googlecalendar',
          setup_check: 'google'
        }
      ]
    };
  },
  computed: {
    user () {
      return this.$store.state.auth.user;
    },
    userSetup () {
      return this.$store.getters.userSetup;
    }
  }
};
</script>

<style lang='scss' scoped>
//Makes the marker appear more clickable to the user
.step-marker {
  cursor: pointer;
}
//Makes the hovered step icon appear more dynamic
.step-marker:hover {
  background-color: #5b9ba0 !important;
}

//Makes the current step bold
.steps .step-item .step-details .step-title {
  font-weight: inherit;
}
.steps .is-active .step-details {
  font-weight: 600 !important;
}
</style>
