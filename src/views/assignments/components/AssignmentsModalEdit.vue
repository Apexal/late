<!--Modals: Edit Assignment (Deprecated?)-->
<template>
  <div
    :class="{'is-active': open}"
    class="edit-assignment-modal modal"
  >
    <div
      class="modal-background"
      @click="$emit('toggle-modal')"
    />
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">
          Edit Assignment
        </p>
      </header>

      <section class="modal-card-body">
        <form
          id="edit-assignment-form"
          class="form"
          @submit.prevent="save"
        >
          <div class="columns is-multiline">
            <div class="column is-half">
              <div class="field">
                <label
                  for="edit-assignment-course-id"
                  class="label"
                >Course</label>
                <div class="control">
                  <select
                    id="edit-assignment-course-id"
                    v-model="courseCRN"
                    :placeholder="courseCRN"
                    name="course_crn"
                    class="input"
                  >
                    <option
                      v-for="c in courses"
                      :key="c.crn"
                      :value="c.crn"
                      :selected="c.crn === courseCRN"
                    >
                      {{ c.title }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div class="column is-half">
              <div class="field">
                <label
                  for="edit-assignment-title"
                  class="label"
                >Title</label>
                <div class="control">
                  <input
                    id="edit-assignment-title"
                    v-model="title"
                    name="title"
                    type="text"
                    class="input"
                    maxlength="200"
                  >
                </div>
              </div>
            </div>
          </div>

          <div class="columns">
            <div class="column">
              <div class="field">
                <label
                  for="edit-assignment-due-date"
                  class="label"
                >Due Date</label>
                <div class="control">
                  <input
                    id="edit-assignment-due-date"
                    v-model="dueDate"
                    :min="minDate"
                    :max="maxDate"
                    type="date"
                    name="due_date"
                  >
                </div>
                <div class="control">
                  <input
                    id="edit-assignment-time"
                    v-model="dueTime"
                    type="time"
                    name="time"
                  >
                </div>
              </div>
            </div>

            <div class="column">
              <div class="field">
                <label
                  for="edit-assignment-time-estimate"
                  class="label"
                >Time Estimate (hrs)</label>
                <input
                  id="edit-assignment-time-estimate"
                  v-model.number="timeEstimate"
                  type="number"
                  name="time-estimate"
                  min="0.5"
                  step="0.5"
                >
              </div>
            </div>

            <div class="column">
              <div class="field">
                <label
                  for="edit-assignment-priority"
                  class="label"
                >Priority</label>
                <input
                  id="edit-assignment-priority"
                  v-model.number="priority"
                  list="priorities"
                  type="range"
                  min="1"
                  max="5"
                  name="edit-assignment-priority"
                  step="1"
                  placeholder="0 - 5"
                >
                <div
                  class="level"
                  style="max-width: 129px"
                >
                  <div style="float:left">
                    low
                  </div>
                  <div style="float:right">
                    high
                  </div>
                </div>
                <div style="clear: both;" />

                <datalist id="edit-assignment-priorities">
                  <option value="1" />
                  <option value="2" />
                  <option value="3" />
                  <option value="4" />
                  <option value="5" />
                </datalist>
              </div>
            </div>
          </div>
        </form>
      </section>

      <footer class="modal-card-foot">
        <span class="is-fullwidth">
          <button
            class="button is-danger is-pulled-right"
            @click="$emit('remove-assignment')"
          >
            Remove
            <span class="icon is-small margin-left">
              <i class="fas fa-times" />
            </span>
          </button>
          <button
            class="button is-warning"
            @click="$emit('toggle-modal')"
          >Cancel</button>
          <button
            form="edit-assignment-form"
            class="button is-success"
            :class="{'is-loading': loading}"
          >Save</button>
        </span>
      </footer>
    </div>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'AssignmentsModalEdit',
  props: {
    open: {
      type: Boolean,
      required: true
    },
    initialAssignment: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      loading: false,
      courseCRN: '',
      title: '',
      dueDate: null,
      dueTime: '',
      timeEstimate: 0,
      priority: 0
    }
  },
  computed: {
    maxDate () {
      return moment(this.currentTerm.endDate).format('YYYY-MM-DD')
    },
    minDate () {
      return moment(this.currentTerm.startDate).format('YYYY-MM-DD')
    }
  },
  watch: {
    initialAssignment (newA) {
      this.convertAssignment(newA)
    }
  },
  mounted () {
    this.convertAssignment(this.initialAssignment)
  },
  methods: {
    convertAssignment (newA) {
      this.courseCRN = newA.courseCRN
      this.title = newA.title
      this.timeEstimate = newA.timeEstimate
      this.priority = newA.priority

      // special case
      this.dueDate = moment(newA.dueDate).format('YYYY-MM-DD')
      this.dueTime = moment(newA.dueDate).format('HH:mm')
    },
    async save () {
      this.loading = true

      let updatedAssignment
      try {
        updatedAssignment = await this.$store.dispatch('UPDATE_ASSESSMENT', {
          assessmentID: this.initialAssignment._id,
          assessmentType: 'assignment',
          updates: {
            title: this.title,
            dueDate: moment(
              this.dueDate + ' ' + this.dueTime,
              'YYYY-MM-DD HH:mm',
              true
            ).toDate(),
            courseCRN: this.courseCRN,
            timeEstimate: this.timeEstimate,
            priority: this.priority
          }
        })
      } catch (e) {
        this.loading = false
        return this.showError(e.response.data.message)
      }

      this.$emit('updated-assessment', updatedAssignment)

      this.loading = false

      // Close modal
      this.$emit('toggle-modal')

      // Notify user
      this.$buefy.toast.open({
        message: `Edited assignment '${updatedAssignment.title}' due ${moment(
          updatedAssignment.dueDate
        ).fromNow()}.`,
        type: 'is-success'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.edit-assignment-modal {
  #edit-assignment-time-estimate {
    width: 150px;
  }
}

.margin-right {
  margin-right: 5px;
}

.margin-left {
  margin-left: 2px !important;
}
</style>
