<!--Assessments: assessment overview priority and due date module-->
<template>
  <div>
    <nav
      class="box level assessment-stats has-text-white is-hidden-mobile"
      :class="[assessment.assessmentType === 'assignment' && assessment.completed ? 'has-background-success' : 'has-background-grey-darker']"
    >
      <div class="level-item has-text-centered">
        <div>
          <p
            class="heading"
            title="The importance of this assessment."
          >
            Priority
          </p>
          <p
            class="subtitle priority"
            :class="{'is-italic': assessment.priority === 1}"
            :style="{'font-weight': fontWeight}"
          >
            <i
              v-if="assessmentType === 'exam' || isOwner"
              v-show="assessment.priority - 1 in priorityStrings"
              class="fas fa-minus has-text-grey decrease-priority"
              :title="
                'Decrease priority to ' + priorityStrings[assessment.priority - 1]
              "
              @click="changePriority(-1)"
            />
            {{ priorityString }}
            <i
              v-if="assessmentType === 'exam' || isOwner"
              v-show="assessment.priority + 1 in priorityStrings"
              class="fas fa-plus has-text-grey increase-priority"
              :title="
                'Increase priority to ' + priorityStrings[assessment.priority + 1]
              "
              @click="changePriority(1)"
            />
          </p>
        </div>
      </div>

      <div class="level-item has-text-centered">
        <div>
          <p
            class="heading"
            title="When is this assessment due?"
          >
            {{
              (assessment.passed ? "Was " : "") +
                (assessmentType === "assignment" ? "Due" : "On")
            }}
          </p>
          <form
            v-if="editingDate"
            class="control date"
            @submit.prevent="updateDate"
          >
            <input
              v-model="tempDateString"
              :min="minDate"
              :max="maxDate"
              type="date"
            >
            <input
              v-model="tempTimeString"
              type="time"
            >
            <i
              class="fas fa-check has-text-success save-date"
              title="Save new date and time."
              @click="updateDate"
            />
          </form>
          <p
            v-else
            class="subtitle date tooltip has-tooltip-bottom"
            :data-tooltip="timeLeft"
          >
            {{ shortDateTimeFormat(assessment.date) }}
            <i
              v-if="assessmentType === 'exam' || isOwner"
              class="fas fa-pencil-alt has-text-grey edit-date"
              title="Edit date and time."
              @click="editingDate = true"
            />
          </p>
        </div>
      </div>
      <div
        v-if="assessmentType === 'exam' && assessment.completed"
        class="level-item has-text-centered"
      >
        <div>
          <p class="heading">
            Completed
          </p>
          <p
            class="subtitle tooltip has-tooltip-bottom"
            :data-tooltip="fromNow(assessment.completedAt)"
          >
            {{ shortDateTimeFormat(assessment.completedAt) }}
          </p>
        </div>
      </div>

      <div
        v-else
        class="level-item has-text-centered"
      >
        <div>
          <p class="heading">
            {{
              assessment.fullyScheduled
                ? "Scheduled " + assessmentActionTerm + " Left"
                : assessmentActionTerm + " Schedule"
            }}
          </p>
          <p
            v-if="assessment.fullyScheduled"
            class="subtitle"
          >
            {{ assessment.scheduledTimeRemaing }}
            <span class="has-text-grey">min</span>
          </p>
          <p v-else>
            <span
              class="tag is-danger not-scheduled-tag"
              @click="$emit('not-fully-scheduled-click')"
            >Not fully scheduled!</span>
          </p>
        </div>
      </div>
    </nav>
    <div
      class="box is-flex has-text-white has-text-weight-medium has-text-centered is-hidden-tablet mobile-stats"
      :class="[assessment.assessmentType === 'assignment' && assessment.completed ? 'has-background-success' : 'has-background-grey-darker']"
    >
      <span
        class="tooltip has-tooltip-bottom"
        :data-tooltip="priorityString + ' Priority'"
      >
        <i
          v-for="n in assessment.priority"
          :key="n"
          class="fas fa-exclamation"
        />
      </span>
      <span
        class="tooltip has-tooltip-bottom"
        :data-tooltip="fromNow(assessment.date) + (assessment.completed ? ` | Completed ${shortDateTimeFormat(assessment.completedAt)}` : '')"
      >{{ shortDateTimeFormat(assessment.date) }}</span>
      <span
        class="tooltip has-tooltip-bottom"
        :data-tooltip="(assessmentType === 'assignment' ? 'Work' : 'Study') + ' minutes left'"
      >{{ assessment.scheduledTimeRemaing }}
        <span class="has-text-grey">min</span>

        <span
          class="tag is-danger not-scheduled-tag"
          @click="$emit('not-fully-scheduled-click')"
        >!</span>
      </span>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import assessmentsMixin from '@/mixins/assessments'

export default {
  name: 'AssessmentOverviewStats',
  mixins: [assessmentsMixin],
  props: {
    assessment: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      loading: false,
      editingDate: false,
      tempDateString: '',
      tempTimeString: ''
    }
  },
  computed: {
    assessmentActionTerm () {
      return this.assessmentType === 'assignment' ? 'Work' : 'Study'
    },
    minDate () {
      return moment(this.course.startDate).format('YYYY-MM-DD')
    },
    maxDate () {
      return moment(this.course.endDate).format('YYYY-MM-DD')
    },
    fontWeight () {
      return (
        {
          1: 300,
          2: 300,
          3: 'normal',
          4: 500,
          5: 700
        }[this.assessment.priority] || 600
      )
    },
    priorityStrings () {
      if (this.assessmentType === 'assignment') {
        return {
          1: 'Optional',
          2: 'Low',
          3: 'Normal',
          4: 'High',
          5: 'Important'
        }
      } else {
        return {
          1: 'Low',
          2: 'Normal',
          3: 'High'
        }
      }
    },
    priorityString () {
      return this.priorityStrings[this.assessment.priority] || 'Unknown'
    },
    timeLeft () {
      const diff = moment.duration(moment(this.assessment.date).diff(this.rightNow))
      return `${diff.days()}d ${diff.hours()}h ${diff.minutes()}m`
    },
    inputFormatDate () {
      return moment(this.assessment.date).format('YYYY-MM-DD')
    },
    inputFormatTime () {
      return moment(this.assessment.date).format('HH:mm')
    }
  },
  watch: {
    assessment () {
      this.editingDate = false
    },
    editingDate () {
      this.tempDateString = this.inputFormatDate
      this.tempTimeString = this.inputFormatTime
    }
  },
  methods: {
    async updateDate () {
      if (this.loading || !this.isOwner) return

      const newDate = moment(
        this.tempDateString + ' ' + this.tempTimeString,
        'YYYY-MM-DD HH:mm',
        true
      )
      if (moment(this.assessment.date).isSame(newDate)) {
        this.editingDate = false
        return
      }

      const propName =
        this.assessmentType === 'assignment' ? 'dueDate' : 'date'
      await this.updateAssessment({
        [propName]: newDate.toDate()
      })

      this.$buefy.toast.open({
        message:
          'Updated ' +
          (this.assessmentType === 'assignment' ? 'due date' : 'date') +
          '!',
        type: 'is-success'
      })

      this.editingDate = false
    },
    async changePriority (change) {
      if (this.loading || !this.isOwner) return

      if (
        this.assessment.priority + change < 1 ||
        this.assessment.priority + change > 5
      ) {
        return
      }
      await this.updateAssessment({
        priority: this.assessment.priority + change
      })
      this.$buefy.toast.open({
        message: 'Updated priority!',
        type: 'is-success'
      })
    },
    async updateAssessment (updates) {
      if (!this.isOwner) return

      this.loading = true

      let updatedAssessment
      try {
        updatedAssessment = await this.$store.dispatch('UPDATE_ASSESSMENT', {
          assessmentID: this.assessment._id,
          assessmentType: this.assessment.assessmentType,
          updates
        })
      } catch (e) {
        this.loading = false
        return this.showError(e.response.data.message)
      }

      this.$emit('updated-assessment', updatedAssessment)

      this.loading = false
      return updatedAssessment
    }
  }
}
</script>

<style lang="scss" scoped>
.mobile-stats {
  margin-top: 10px;
  padding: 10px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  > span {
    flex: 1;
  }
}
.not-scheduled-tag {
  cursor: pointer;
}

.level.assessment-stats {
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
  margin-top: 20px;
  margin-bottom: 0;
  padding: 5px;

  .level-item .subtitle {
    color: white;
  }

  .decrease-priority,
  .increase-priority,
  .edit-date,
  .save-date {
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.2s;
  }
  .save-date {
    margin-left: 5px;
  }
  .priority:hover {
    .decrease-priority,
    .increase-priority {
      opacity: 1;
    }
  }

  .date:hover {
    .edit-date,
    .save-date {
      opacity: 1;
    }
  }
}
</style>
