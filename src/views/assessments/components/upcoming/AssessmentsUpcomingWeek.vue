<template>
  <div class="assessments-upcoming-week">
    <h1 class="subtitle week-name">
      {{ weekName }}
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
            class="panel-heading has-background-dark has-text-white is-unselectable key-heading"
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
          <AssessmentPanelBlock
            v-for="a in assessments"
            :key="a._id"
            :group-by="'date'"
            :show-scheduled="false"
            :assessment="a"
          />
        </div>
      </div>
    </div>
    <hr>
  </div>
</template>

<script>
import moment from 'moment'
import AssessmentPanelBlock from '@/views/assessments/components/upcoming/AssessmentPanelBlock'

export default {
  name: 'AssessmentsUpcomingWeek',
  components: { AssessmentPanelBlock },
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
    headerTitle (key) {
      const today = moment().startOf('day')
      const day = moment(key, 'YYYY-MM-DD', true)
      if (day.diff(today, 'days') > 1) return day.from(today)

      return ''
    },
    headerText (key) {
      return this.relativeDateFormat(moment(key, 'YYYY-MM-DD', true))
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
