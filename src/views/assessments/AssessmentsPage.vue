<!--Assessments: All assessments list page-->
<template>
  <section class="section assessment-list">
    <h1 class="is-hidden-desktop has-text-centered is-marginless title">
      {{ title }}
    </h1>

    <div class="tab-nav tabs is-centered">
      <ul>
        <h1
          class="is-hidden-touch title"
          style="flex: 1"
        >
          {{ title }}
        </h1>

        <router-link
          tag="li"
          :to="{name: 'coursework-upcoming'}"
          title="Switch to view upcoming assessments"
        >
          <a>Upcoming</a>
        </router-link>
        <router-link
          tag="li"
          :to="{name: 'coursework-past'}"
          title="Switch to view past assessments"
        >
          <a>Past</a>
        </router-link>

        <router-link
          tag="li"
          :to="{name: 'coursework-calendar'}"
          title="Switch to view your assessment calendar"
        >
          <a>Calendar</a>
        </router-link>
      </ul>
    </div>

    <!-- <AssessmentsFilterModal
      :open="filtersModalOpen"
      :filter="hiddenCourseCRNs"
      :show-show-completed="true"
      :show-completed="showCompleted"
      :show-scheduled="showScheduled"
      :show-group-by="view === 'coursework-upcoming'"
      :group-by="groupBy"
      @toggle-filter="toggleFilter"
      @set-filter-course-crns="hiddenCourseCRNs = arguments[0]"
      @toggle-show-completed="showCompleted = !showCompleted"
      @change-group-by="groupBy = $event"
      @toggle-show-scheduled="showScheduled = !showScheduled"
      @close-modal="filtersModalOpen = false"
    /> -->

    <transition
      name="slide-left"
      mode="out-in"
    >
      <router-view
        class="child-view"
        :show-completed="showCompleted"
        :show-scheduled="showScheduled"
      />
    </transition>
    <hr>
    <div class="buttons">
      <b-button
        title="Show completed assignments?"
        :type="showCompleted ? '' : 'is-warning'"
        @click="showCompleted = !showCompleted"
      >
        <span class="icon">
          <i class="fas fa-filter" />
        </span>
        <span>{{ showCompleted ? "Showing" : "Hiding" }} completed</span>
      </b-button>
      <span class="spacer" />
      <b-button
        type="is-dark"
        title="Add an assignment"
        @click="$store.commit('TOGGLE_ADD_ASSIGNMENT_MODAL')"
      >
        <span class="icon">

          <i class="fas fa-clipboard-check" />
        </span>
        <span>Add Assignment</span>
      </b-button>
      <b-button
        type="is-dark"
        title="Add an exam"
        @click="$store.commit('TOGGLE_ADD_EXAM_MODAL')"
      >
        <span class="icon">

          <i class="fas fa-exclamation-triangle" />
        </span>

        <span>Add Exam</span>
      </b-button>
    </div>
  </section>
</template>

<script>

export default {
  name: 'AssessmentsPage',
  data () {
    return {
      showCompleted: true,
      showScheduled: true
    }
  },
  computed: {
    view () {
      return this.$route.name
    },
    title () {
      return this.$route.meta.title
    }
  },
  watch: {
    showCompleted (nowShowing) {
      localStorage.setItem('assignmentsShowCompleted', nowShowing)
      this.$buefy.toast.open({
        message:
          (nowShowing ? 'Showing' : 'Hiding') + ' completed assignments.',
        type: 'is-info',
        duration: 1000
      })
    },
    showScheduled (nowShowing) {
      localStorage.setItem('assignmentsShowScheduled', nowShowing)
      this.$buefy.toast.open({
        message:
          (nowShowing ? 'Showing' : 'Hiding') + ' schedule warnings.',
        type: 'is-info',
        duration: 1000
      })
    }
  },
  mounted () {
    if (localStorage.getItem('assignmentsShowCompleted')) {
      try {
        this.showCompleted = JSON.parse(
          localStorage.getItem('assignmentsShowCompleted')
        )
      } catch (e) {
        localStorage.removeItem('assignmentsShowCompleted')
      }
    }
    if (localStorage.getItem('assignmentsShowScheduled')) {
      try {
        this.showScheduled = JSON.parse(
          localStorage.getItem('assignmentsShowScheduled')
        )
      } catch (e) {
        localStorage.removeItem('assignmentsShowScheduled')
      }
    }
  },
  methods: {
    course (ex) {
      return this.$store.getters.getCourseFromCRN(ex.courseCRN)
    }
  }
}
</script>

<style lang="scss" scoped>
.spacer {
  flex: 1;
}
</style>
