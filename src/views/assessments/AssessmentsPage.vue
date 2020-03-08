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

    <AssessmentsFilterModal
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
    />

    <transition
      name="slide-left"
      mode="out-in"
    >
      <router-view
        class="child-view"
        :group-by="groupBy"
        :show-completed="showCompleted"
        :show-scheduled="showScheduled"
        :filter="hiddenCourseCRNs"
      />
    </transition>
    <hr>
    <div class="buttons">
      <b-button
        title="Change how assignments and exams are shown"
        :type="isFilterActive ? 'is-warning' : undefined"
        @click="filtersModalOpen = true"
      >
        <span class="icon">
          <i class="fas fa-filter" />
        </span>
        <span>Filters</span>
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
import AssessmentsFilterModal from '@/views/assessments/components/AssessmentsFilterModal'

export default {
  name: 'AssessmentsPage',
  components: { AssessmentsFilterModal },
  data () {
    return {
      groupBy: 'date',
      showCompleted: true,
      showScheduled: true,
      hiddenCourseCRNs: [],
      filtersModalOpen: false
    }
  },
  computed: {
    view () {
      return this.$route.name
    },
    isFilterActive () {
      return this.hiddenCourseCRNs.length > 0 || !this.showCompleted
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
    groupBy (newGroupBy) {
      localStorage.setItem('assessmentsGroupBy', newGroupBy)
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
    if (localStorage.getItem('assessmentsGroupBy')) {
      try {
        this.groupBy = localStorage.getItem('assessmentsGroupBy') || 'date'
        if (this.groupBy !== 'courseCRN' && this.groupBy !== 'date') {
          throw new Error(
            'Invalid value for assessmentsGroupBy in localStorage'
          )
        }
      } catch (e) {
        localStorage.removeItem('assessmentsGroupBy')
      }
    }
  },
  methods: {
    course (ex) {
      return this.$store.getters.getCourseFromCRN(ex.courseCRN)
    },
    isFiltered (c) {
      return this.filter.includes(c.crn)
    },
    toggleFilter (c) {
      // TODO change word assessments to exam or assignment depending on type
      if (this.filter.includes(c.crn)) {
        this.filter.splice(this.filter.indexOf(c.crn), 1)
        this.$buefy.toast.open({
          message: `Showing '${c.title}' coursework.`,
          type: 'is-info',
          duration: 1000
        })
      } else {
        this.filter.push(c.crn)
        this.$buefy.toast.open({
          message: `Hiding '${c.title}' coursework.`,
          type: 'is-info',
          duration: 1000
        })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.spacer {
  flex: 1;
}
</style>
