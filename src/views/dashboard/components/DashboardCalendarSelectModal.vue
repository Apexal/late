<!--Modals: Select calendar assignment modal(?)-->
<template>
  <b-modal
    :active="open"
    class="dashboard-calendar-select-modal"
    @close="$emit('close-modal')"
  >
    <div class="modal-content panel">
      <p class="panel-heading">
        What do you want to do from
        <b>{{ dateStrs.start }}</b> to
        <b>{{ dateStrs.end }}</b>?
      </p>
      <!-- Buefy version of tabs -->
      <div class="panel-block is-marginless is-paddingless">
        <b-tabs
          position="is-centered"
          class="block"
          expanded
        >
          <b-tab-item label="Study/Work on Item">
            <div
              v-if="assessments.length === 0"
              class="panel-block has-text-grey"
            >
              No assignments or exams are open to work on at that time.
            </div>
            <div
              v-for="assessment in showingAssessments"
              :key="assessment._id"
              class="panel-block is-flex"
              @click="$emit('add-assessment-block', assessment)"
            >
              <span style="flex: 1">
                <span
                  class="tag"
                  :style="tagStyle(assessment)"
                >{{ getCourseFromCRN(assessment.courseCRN).title }}</span>
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
            <div
              v-if="hasExtraAssesments"
              class="panel-block has-text-grey has-text-centered"
              @click="showingExtra = !showingExtra"
            >
              <span class="is-fullwidth">
                {{ showingExtra ? "Hide" : "Show" }} Extra ({{
                  extraAssessments.length
                }})
              </span>
            </div>
          </b-tab-item>
          <b-tab-item label="Study for Course">
            <div
              v-if="courses.length === 0"
              class="panel-block has-text-grey"
            >
              No ongoing courses at that time.
            </div>
            <div
              v-for="c in courses"
              :key="c.crn"
              class="panel-block"
              @click="$emit('add-course-block', c)"
            >
              <CourseAssessmentDot :course="c" />
              {{ c.title }}
            </div>
          </b-tab-item>
          <b-tab-item label="Work on To-Dos">
            <div
              v-if="showingTodos.length === 0"
              class="panel-block has-text-grey"
            >
              No todos are open to work on at that time.
            </div>
            <div
              v-for="todo in showingTodos"
              :key="todo.index"
              class="panel-block"
              @click="$emit('add-todo-block', todo)"
            >
              {{ todo.text }}
            </div>
            <div
              v-if="hasExtraTodos"
              class="panel-block has-text-grey has-text-centered"
              @click="showingExtra = !showingExtra"
            >
              <span class="is-fullwidth">
                {{ showingExtra ? "Hide" : "Show" }} Extra ({{
                  extraTodos.length
                }})
              </span>
            </div>
          </b-tab-item>
        </b-tabs>
      </div>
      <!-- This div block displays the list of assignments -->
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
      limit: 3,
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
    todos () {
      return this.$store.state.todos.todos
    },
    incompleteTodos () {
      return this.todos.filter(todo => !todo.completed)
    },
    limitedTodos () {
      return this.incompleteTodos.slice(0, this.limit)
    },
    showingAssessments () {
      return this.showingExtra ? this.assessments : this.limitedAssessments
    },
    showingTodos () {
      return this.showingExtra ? this.incompleteTodos : this.limitedTodos
    },
    limitedAssessments () {
      return this.assessments.slice(0, this.limit)
    },
    extraAssessments () {
      if (!this.hasExtraAssesments) return []
      return this.assessments.slice(this.limit, this.assessments.length)
    },
    extraTodos () {
      if (!this.hasExtraTodos) return []
      return this.incompleteTodos.slice(this.limit, this.incompleteTodos.length)
    },
    hasExtraAssesments () {
      return this.assessments.length > this.limit
    },
    hasExtraTodos () {
      return this.incompleteTodos.length > this.limit
    }
  },
  methods: {
    // Returns style of course tag
    // Used when adding work block from dashboard calendar
    // Background is course color
    // If course color is dark, use light text. If course color is light, use dark text
    tagStyle (assessment) {
      return {
        'background-color': this.getCourseFromCRN(assessment.courseCRN).color,
        color: this.getCourseFromCRN(assessment.courseCRN).color.replace('#', '0x') > 0xffffff / 1.2 ? '#333' : '#fff'
      }
    }
  }
}
</script>

<style lang="scss">
.block .tab-content {
  padding: 0;
}
</style>
