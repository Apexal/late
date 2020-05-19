<!--Account Setup: Main Account setup container-->

<template>
  <div id="account">
    <section class="section">
      <h1 class="title">
        Your Account
      </h1>

      <b-steps
        v-model="setupIndex"
        :has-navigation="false"
        icon-pack="fas"
        class="is-hidden-desktop"
        vertical
      >
        <template v-for="(step, index) in setups">
          <b-step-item
            :key="index"
            :step="index + 1"
            :label="step.label"
            :clickable="true"
            :has-navigation="false"
            :type="{'is-success': userSetup[step.setup_check]}"
          />
        </template>
      </b-steps>

      <b-steps
        v-model="setupIndex"
        :has-navigation="false"
        icon-pack="fas"
        class="is-hidden-touch"
      >
        <template v-for="(step, index) in setups">
          <b-step-item
            :key="index"
            :step="index + 1"
            :label="step.label"
            :clickable="true"
            :has-navigation="false"
            :type="{'is-success': userSetup[step.setup_check]}"
          />
        </template>
      </b-steps>

      <keep-alive>
        <transition
          name="slide-left"
          mode="out-in"
        >
          <router-view
            class="child-view"
          />
        </transition>
      </keep-alive>
    </section>
  </div>
</template>

<script>
export default {
  name: 'AccountPage',
  data () {
    return {
      setups: [
        {
          label: 'Profile',
          link: '/account/profile',
          setup_check: 'profile'
        },
        {
          label: 'School Terms',
          link: '/account/terms',
          setup_check: 'terms'
        },
        {
          label: 'Course Schedule',
          link: '/account/courseschedule',
          setup_check: 'course_schedule'
        },
        {
          label: 'Unavailability',
          link: '/account/unavailability',
          setup_check: 'unavailability'
        },
        {
          label: 'Notifications',
          link: '/account/integrations',
          setup_check: 'integrations'
        }
      ]
    }
  },
  computed: {
    userSetup () {
      return this.$store.getters.userSetup
    },
    setupIndex: {
      get () {
        const index = this.setups.indexOf(this.setups.find(s => { return s.link === this.$route.path }))
        return Math.max(index, 0)
      },
      set (index) {
        this.$router.push(this.setups[index].link)
      }
    }
  }
}
</script>

<style>
nav.steps {
  flex: 1;
}
section.step-content {
  display: none !important;
}

.integration-note {
  text-align: center;
  margin: 1.5em 0em 1em 0em;
}
</style>
