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

    <AssessmentsFilter
      :filter="filter"
      :show-show-completed="true"
      :show-completed="showCompleted"
      :show-scheduled="showScheduled"
      :show-group-by="view === 'coursework-upcoming'"
      :group-by="groupBy"
      @toggle-filter="toggleFilter"
      @toggle-show-completed="showCompleted = !showCompleted"
      @change-group-by="groupBy = $event"
      @toggle-show-scheduled="showScheduled = !showScheduled"
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
        :filter="filter"
        @toggle-assignment="toggleAssignment"
      />
    </transition>
    <hr>
    <div class="buttons">
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
import AssessmentsFilter from '@/views/assessments/components/AssessmentsFilter'

export default {
  name: 'AssessmentsPage',
  components: { AssessmentsFilter },
  data () {
    return {
      groupBy: 'date',
      showCompleted: true,
      showScheduled: true,
      filter: []
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
    async toggleAssignment (assignment) {
      try {
        const toggledAssignment = await this.$store.dispatch(
          'TOGGLE_ASSIGNMENT',
          assignment
        )

        this.$buefy.snackbar.open({
          message: `Marked '${toggledAssignment.title}' as ${
            toggledAssignment.completed ? 'complete' : 'incomplete'
          }!`,
          type: 'is-primary',
          position: 'is-bottom',
          actionText: 'View',
          onAction: () => {
            this.$router.push({
              name: 'assignment-overview',
              params: { assignmentID: assignment._id }
            })
          }
        })
      } catch (e) {
        return this.$buefy.toast.open({
          message: e.response.data.message,
          type: 'is-danger'
        })
      }
    },
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
span.tag.course-tag {
  cursor: pointer;
  //font-weight: bold;
  margin: 0;
  margin-left: 2px;
  margin-right: 2px;
  color: white;

  span {
    max-width: 150px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: 0.3s;
    -webkit-transition: 0.3s;
    transition-delay: 0.1s;
    -webkit-transition-delay: 0.1s;
  }

  span:hover {
    max-width: 100vw;
    transition: 0.4s;
    -webkit-transition: 0.4s;
    //transition-delay:0.3s;
  }
}

.level .disable-shrink {
  flex-shrink: initial;
}

@media only screen and (max-width: 768px) {
  .buttons.assignment-view-buttons {
    float: unset !important;
  }
  .buttons.exam-view-buttons {
    float: unset !important;
  }
  // TODO^^

  .level-left + .level-right {
    margin-top: 5px !important;
  }
}

.tab-nav {
  margin-bottom: 0;
  .title {
    margin: 0;
  }
}

.buttons {
  justify-content: flex-end;
}
</style>
