<!--Modals: Add exam (deprecated?)-->
<template>
  <div
    :class="{'is-active': open}"
    class="modal edit-exam-modal"
  >
    <div
      class="modal-background"
      @click="$emit('toggle-modal')"
    />

    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">
          Edit Exam
        </p>
      </header>

      <section class="modal-card-body">
        <form
          id="edit-exam-form"
          class="form"
          @submit.prevent="save"
        >
          <div class="columns is-multiline">
            <div class="column is-half">
              <div class="field">
                <label
                  for="edit-exam-course-id"
                  class="label"
                >Course</label>
                <div class="control">
                  <select
                    id="edit-exam-course-id"
                    v-model="exam.courseCRN"
                    class="input"
                    required
                  >
                    <option
                      v-for="c in courses"
                      :key="c.crn"
                      :value="c.crn"
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
                  for="edit-exam-title"
                  class="label"
                >Exam Title</label>
                <div class="control">
                  <input
                    id="edit-exam-title"
                    v-model.trim="exam.title"
                    type="text"
                    class="input"
                    maxlength="200"
                    placeholder="Short descriptive title"
                    required
                  >
                </div>
              </div>
            </div>

            <div class="column">
              <div class="field">
                <label
                  for="edit-exam-description"
                  class="label"
                >Description</label>
                <div class="control">
                  <textarea
                    id="edit-exam-description"
                    v-model.trim="exam.description"
                    cols="30"
                    rows="10"
                    class="input"
                    placeholder="Long description of the exam"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="columns">
            <div class="column">
              <div class="field">
                <label
                  for="edit-exam-date"
                  class="label"
                >When</label>
                <div class="control">
                  <input
                    id="edit-exam-date"
                    v-model="exam.date"
                    :min="minDate"
                    :max="maxDate"
                    type="date"
                  >
                </div>
                <div class="control">
                  <input
                    id="edit-exam-time"
                    v-model="exam.time"
                    type="time"
                    name="time"
                  >
                </div>
              </div>
            </div>

            <div class="column">
              <div class="field">
                <label
                  for="edit-exam-time-estimate"
                  class="label"
                >Time Estimate (hrs)</label>
                <input
                  id="edit-exam-time-estimate"
                  v-model.number="exam.timeEstimate"
                  type="number"
                  min="0.5"
                  max="100"
                  step="0.5"
                >
              </div>
            </div>

            <div class="column">
              <div class="field">
                <label
                  for="edit-exam-priority"
                  class="label"
                >Priority</label>
                <input
                  id="edit-exam-priority"
                  v-model.number="exam.priority"
                  list="edit-exam-priorities"
                  type="range"
                  min="1"
                  max="3"
                  step="1"
                  placeholder="1 - 3"
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

                <datalist id="edit-exam-priorities">
                  <option value="1" />
                  <option value="2" />
                  <option value="3" />
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
            @click="$emit('remove-exam')"
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
            form="edit-exam-form"
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
  name: 'ExamsModalEdit',
  props: {
    open: {
      type: Boolean,
      required: true
    },
    initialExam: {
      type: Object,
      default: () => ({
        courseCRN: '',
        title: '',
        description: '',
        date: moment()
          .add(7, 'days')
          .format('YYYY-MM-DD'),
        time: '18:00', // HH:mm
        timeEstimate: 2,
        priority: 2
      }),
      required: true
    }
  },
  data () {
    return {
      loading: false,
      exam: this.convertExam(this.initialExam)
    }
  },
  computed: {
    maxDate () {
      return moment(this.currentTerm.endDate).format('YYYY-MM-DD')
    },
    minDate () {
      return moment(this.currentTerm.startDate).format('YYYY-MM-DD')
    },
    saved () {
      return (
        JSON.stringify(this.convertExam(this.initialExam)) ===
        JSON.stringify(this.exam)
      )
    }
  },
  watch: {
    initialExam (newEx) {
      this.exam = this.convertExam(newEx)
    }
  },
  methods: {
    convertExam (exam) {
      const data = Object.assign({}, exam)
      data.date = moment(exam.date).format('YYYY-MM-DD')
      data.time = moment(exam.date).format('HH:mm')
      return data
    },
    async save () {
      this.loading = true

      let updatedExam
      try {
        updatedExam = await this.$store.dispatch('UPDATE_ASSESSMENT', {
          assessmentID: this.initialExam._id,
          assessmentType: 'exam',
          updates: {
            title: this.exam.title,
            description: this.exam.description,
            date: moment(
              this.exam.date + ' ' + this.exam.time,
              'YYYY-MM-DD HH:mm',
              true
            ).toDate(),
            courseCRN: this.exam.courseCRN,
            timeEstimate: this.exam.timeEstimate,
            priority: this.exam.priority
          }
        })
      } catch (e) {
        this.loading = false
        return this.showError(e.response.data.message)
      }

      this.$emit('updated-assessment', updatedExam)

      this.loading = false

      // Close modal
      this.$emit('toggle-modal')

      // Notify user
      this.$buefy.toast.open({
        message: `Edited exam '${updatedExam.title}' on ${moment(
          updatedExam.date
        ).fromNow()}.`,
        type: 'is-success'
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.edit-exam-modal {
  #edit-exam-description {
    width: 100%;
    min-width: 100%;
    max-width: 500px;

    min-height: 100px;
    height: 200px;
    max-height: 500px;
  }
}

.margin-right {
  margin-right: 5px;
}

.margin-left {
  margin-left: 2px !important;
}
</style>
