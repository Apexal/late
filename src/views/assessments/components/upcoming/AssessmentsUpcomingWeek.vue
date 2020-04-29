<template>
  <div class="assessments-upcoming-week">
    <h1 class="title is-size-4 has-text-weight-medium week-name">
      Due {{ weekName }} <span class="has-text-grey">({{ weekAssessments.length }})</span>
      <!-- <span class="tag is-danger">Heavy</span> -->
    </h1>
    <div class="columns is-multiline">
      <div
        v-for="(assessments, key) in groupedAssessments"
        :key="key"
        class="column is-one-third-desktop is-half-tablet"
      >
        <div class="panel">
          <p
            class="panel-heading has-text-white is-unselectable key-heading"
            :class="headerClass(key)"
          >
            <span
              class="key"
              :title="headerTitle(key)"
              @click="headerClick(key)"
            >{{ headerText(key) }}</span>
            <span class="add-assessment-buttons">
              <i
                class="has-text-white fas fa-clipboard-check"
                :title="addAssessmentTitle(key, 'assignment')"
                @click="addAssessmentClick(key, 'assignment')"
              />
              <i
                class="has-text-white fas fa-exclamation-triangle"
                :title="addAssessmentTitle(key, 'exam')"
                @click="addAssessmentClick(key, 'exam')"
              />
            </span>
          </p>
          <Draggable
            :list="assessments"
            group="upcoming-assessments"
            :move="checkAssessmentDrag"
            handle=".drag-assessment"
            :data-date="key"
            @end="draggedAssessment"
          >
            <AssessmentPanelBlock
              v-for="a in assessments"
              :key="a._id"
              :group-by="'date'"
              :show-scheduled="false"
              :assessment="a"
              :data-assessment-id="a.id"
              :data-assessment-type="a.assessmentType"
            />
          </Draggable>
        </div>
      </div>
    </div>
    <hr>
  </div>
</template>

<script>
import Draggable from 'vuedraggable'
import moment from 'moment'
import AssessmentPanelBlock from '@/views/assessments/components/upcoming/AssessmentPanelBlock'

export default {
  name: 'AssessmentsUpcomingWeek',
  components: { Draggable, AssessmentPanelBlock },
  props: {
    weekNumber: { type: Number, required: true },
    weekAssessments: { type: Array, required: true }
  },
  computed: {
    groupedAssessments () {
      return this.$store.getters.groupAssessments(
        'date',
        this.weekAssessments
      )
    },
    weekName () {
      switch (this.weekNumber) {
        case 0:
          return 'This Week'
        case 1:
          return 'Next Week'
        default:
          return `In ${this.weekNumber} Weeks`
      }
    }
  },
  methods: {
    checkAssessmentDrag (event) {
      return event.from.dataset.date !== event.to.dataset.date
    },
    async draggedAssessment ({ item, from, to }) {
      if (from.dataset.date === to.dataset.date) return false
      // Change assessment due date to other date
      const assessmentID = item.dataset.assessmentId
      const assessmentType = item.dataset.assessmentType

      const assessment = await this.$store.getters.getUpcomingAssessmentById(assessmentID)
      if (!assessment) return false

      const newDate = moment(to.dataset.date, 'YYYY-MM-DD', true)

      const newDueDate = moment(assessment.dueDate)
      newDueDate.set({
        year: newDate.year(),
        month: newDate.month(),
        date: newDate.date()
      })

      try {
        await this.$store.dispatch('UPDATE_ASSESSMENT', { assessmentID, assessmentType, updates: { [assessmentType === 'assignment' ? 'dueDate' : 'date']: newDueDate } })
        this.$store.commit('SORT_UPCOMING_ASSESSMENTS')
      } catch (e) {
        this.showError(`Failed to rescheduled ${assessmentType}...`)
        return
      }

      this.$buefy.toast.open({ type: 'is-success', message: `Rescheduled ${assessmentType}!`, duration: 3000 })
    },
    headerTitle (key) {
      const today = moment().startOf('day')
      const day = moment(key, 'YYYY-MM-DD', true)
      if (day.diff(today, 'days') > 1) return day.from(today)

      return ''
    },
    headerText (key) {
      return this.relativeDateFormat(moment(key, 'YYYY-MM-DD', true))
    },
    headerClass (key) {
      switch (this.headerText(key)) {
        case 'Today':
        case 'Tomorrow':
          return 'has-background-grey-darker'
        default:
          return 'has-background-dark'
      }
    },
    headerClick (key) {
      // TODO: this will open DayModal
      // this.$store.commit('SET_ADD_ASSIGNMENT_MODAL_VALUES', {
      //   dueDate: moment(key)
      // });
      // this.$store.commit('TOGGLE_ADD_ASSIGNMENT_MODAL');
    },
    addAssessmentClick (key, assessmentType) {
      const updates = {}
      updates[assessmentType === 'assignment' ? 'dueDate' : 'date'] = moment(
        key
      )
      updates.modalStep = 0

      this.$store.commit(
        'SET_ADD_' + assessmentType.toUpperCase() + '_MODAL_VALUES',
        updates
      )
      this.$store.commit(
        'TOGGLE_ADD_' + assessmentType.toUpperCase() + '_MODAL'
      )
    },
    addAssessmentTitle (date, assessmentType) {
      return `Add new ${assessmentType} on ${moment(
          date,
          'YYYY-MM-DD',
          true
        ).format('M/DD/YY')}`
    },
    relativeDateFormat (dueDate) {
      if (moment(dueDate).isSame(moment(), 'day')) return 'Today'
      if (moment(dueDate).isSame(moment().add(1, 'day'), 'day')) {
        return 'Tomorrow'
      }
      return moment(dueDate).format('dddd [the] Do')
    },
    daysAway (date) {
      return moment(date).diff(moment(this.rightNow).startOf('day'), 'days')
    }
  }
}
</script>

<style lang="scss" scoped>
.week-name {
  position: sticky;
  top: 60px;
  background-color: white;
  border-radius: 6px;
  z-index: 10;
  display: inline-block;
  padding: 5px;
}
.key-heading {
  position: relative;
  span.key.courseCRN {
    cursor: pointer;
  }

  .add-assessment-buttons {
    position: absolute;
    right: 10px;

    transition: opacity 0.1s;
    @media only screen and (min-width: 768px) {
      opacity: 0;
    }
    i {
      cursor: pointer;
      padding-left: 10px;
    }
  }

  &:hover {
    .add-assessment-buttons {
      opacity: 1;
    }
  }
}
</style>
