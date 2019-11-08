<!--Modals: Select calendar assignment modal(?)-->
<template>
  <b-modal
    :active="open"
    class="dashboard-calendar-select-modal"
    @close="$emit('close-modal')"
  >
    <div class="modal-content panel">
      <p class="panel-heading">
        Schedule
        <b>{{ dateStrs.start }}</b> to
        <b>{{ dateStrs.end }}</b>
      </p>
      <div
        v-if="assessments.length === 0"
        class="panel-block has-text-grey"
      >
        No assignments or exams are open to work on at that time.
      </div>
      <div
        v-for="assessment in limitedAssessments"
        :key="assessment._id"
        class="panel-block is-flex"
        @click="$emit('add-work-block', assessment)"
      >
        <span style="flex: 1">
          <span
            class="tag"
            :style="tagStyle(assessment)"
          >{{ course(assessment.courseCRN).title }}</span>
          {{ assessment.assessmentType === 'assignment' ? 'Work on' : 'Study for' }}
          <b>{{ assessment.title }}</b>
          <i
            v-if="
              assessment.assessmentType === 'assignment' && assessment.shared
            "
            class="fas fa-users has-text-grey-light"
            title="Shared assignment"
          />
        </span>
        <span
          class="has-text-grey is-pulled-right"
        >due {{ shortDateTimeFormat(assessment.dueDate || assessment.date) }}</span>
      </div>
      <template v-if="hasExtra">
        <div v-if="showingExtra">
          <div
            v-for="assessment in extraAssessments"
            :key="assessment._id"
            class="panel-block is-flex"
            @click="$emit('add-work-block', assessment)"
          >
            <span style="flex: 1">
              <span
                class="tag assessment-type-tag"
                :style="{
                  'background-color': course(assessment.courseCRN).color
                }"
              >{{ assessment.assessmentType }}</span>
              {{ assessment.title }}
            </span>
            <span class="has-text-grey is-pulled-right">
              due
              {{ shortDateTimeFormat(assessment.dueDate || assessment.date) }}
            </span>
          </div>
        </div>
        <div
          class="panel-block has-text-grey has-text-centered"
          @click="showingExtra = !showingExtra"
        >
          <span class="is-fullwidth">
            {{ showingExtra ? "Hide" : "Show" }} Extra ({{
              extraAssessments.length
            }})
          </span>
        </div>
      </template>
    </div>
  </b-modal>
</template>

<script>
export default {
  name: 'DashboardCalendarSelectModal',
  props: {
    open: {
      type: Boolean,
      required: true
    },
    start: {
      type: Object,
      required: true
    },
    end: {
      type: Object,
      required: true
    },
    assessments: {
      type: Array,
      required: true
    }
  },
  data () {
    return {
      limit: 10,
      showingExtra: false
    }
  },
  computed: {
    dateStrs () {
      return {
        start: this.shortDateTimeFormat(this.start),
        end: this.start.isSame(this.end, 'day')
          ? this.timeFormat(this.end)
          : this.shortDateTimeFormat(this.end)
      }
    },
    limitedAssessments () {
      return this.assessments.slice(0, this.limit)
    },
    extraAssessments () {
      if (!this.hasExtra) return []
      return this.assessments.slice(this.limit, this.assessments.length)
    },
    hasExtra () {
      return this.assessments.length > this.limit
    }
  },
  methods: {
    course (crn) {
      return this.$store.getters.getCourseFromCRN(crn)
    },
    // Returns style of course tag
    // Used when adding work block from dashboard calendar
    // Background is course color
    // If course color is dark, use light text. If course color is light, use dark text
    tagStyle (assessment) {
      return {
        'background-color': this.course(assessment.courseCRN).color,
        color: this.course(assessment.courseCRN).color.replace('#', '0x') > 0xffffff / 1.2 ? '#333' : '#fff'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
