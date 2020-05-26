<!--Dashboard: Main dashboard container-->
<template>
  <section class="section dasboard">
    <h1 class="is-hidden-desktop has-text-centered is-marginless title">
      {{ onBreak ? `On Break${nextTerm ? (' - ' + nextTerm.name + ' Sneak Peek') : ''}` : "Your Dashboard" }}
    </h1>

    <div class="tabs is-centered">
      <ul>
        <h1
          class="is-hidden-touch title"
          style="flex: 1"
        >
          {{ onBreak ? `On Break${nextTerm ? (' - ' + nextTerm.name + ' Sneak Peek') : ''}` : "Your Dashboard" }}
        </h1>
        <router-link
          v-if="!onBreak"
          :to="{name: 'dashboard-overview'}"
          tag="li"
        >
          <a>Overview</a>
        </router-link>
        <router-link
          v-if="!onBreak"
          :to="{name: 'dashboard-calendar'}"
          tag="li"
        >
          <a>Calendar</a>
        </router-link>
      </ul>
    </div>
    <DashboardNextTermPreview v-if="onBreak && nextTerm" />
    <template v-else-if="onBreak">
      <h2 class="subtitle">
        You are on break! LATE will be available when you get back to school.
      </h2>
      <hr>
      <button
        class="button is-primary"
        :class="{'is-loading': loading}"
        @click="addTerm('202005')"
      >
        <span class="icon">
          <i class="fas fa-plus" />
        </span>
        <span>I'm doing Arch!</span>
      </button>
    </template>
    <router-view v-else />
  </section>
</template>

<script>
import DashboardNextTermPreview from './components/DashboardNextTermPreview'

export default {
  name: 'TheDashboard',
  components: { DashboardNextTermPreview },
  data () {
    return {
      loading: false
    }
  },
  computed: {
    tab () {
      return this.$route.hash.substring(1) || 'calendar'
    },
    nextTerm () {
      return this.$store.getters.nextTerm
    }
  },
  methods: {
    async addTerm (termCode) {
      this.loading = true

      let request
      try {
        request = await this.$http.post('/account/terms', {
          termCodes: [...this.user.terms, '202005']
        })
      } catch (e) {
        this.loading = false
        return this.showError(e.response.data.message)
      }

      await this.$store.dispatch('SET_USER', request.data.updatedUser)
      if (this.$store.getters.onBreak) {
        this.$store.commit('SET_UPCOMING_ASSESSMENTS', [])
        this.$store.commit('SET_COURSES', [])
      } else {
        await this.$store.dispatch('GET_COURSES')
        await this.$store.dispatch('GET_UNAVAILABILITIES')
        await this.$store.dispatch('AUTO_GET_UPCOMING_WORK')
      }

      this.loading = false
    }
  }
}
</script>

<style lang='scss'>
.tabs .title {
  margin: 0;
}
</style>
