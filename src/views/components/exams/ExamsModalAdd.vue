<template>
  <div
    :class="{'is-active': open}"
    class="add-exam-modal modal"
  >
    <div
      class="modal-background"
      @click="$emit('toggle-modal')"
    />
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">
          Add Exam
        </p>
      </header>

      <section class="modal-card-body">
        <form
          id="add-exam-form"
          class="form"
          @submit.prevent="save"
        >
          <div class="columns is-multiline">
            <div class="column is-half">
              <div class="field">
                <label
                  for="add-exam-course-id"
                  class="label"
                >
                  Course
                </label>
                <div class="control">
                  <select
                    id="add-exam-course-id"
                    v-model="courseCRN"
                    class="input"
                    required
                  >
                    <option
                      v-for="c in courses"
                      :key="c.crn"
                      :value="c.crn"
                    >
                      {{ c.longname }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div class="column is-half">
              <div class="field">
                <label
                  for="add-exam-title"
                  class="label"
                >
                  Exam Title
                </label>
                <div class="control">
                  <input
                    id="add-exam-title"
                    v-model.trim="title"
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
                  for="add-exam-description"
                  class="label"
                >
                  Description
                </label>
                <div class="control">
                  <textarea
                    id="add-exam-description"
                    v-model.trim="description"
                    cols="30"
                    rows="10"
                    class="input"
                    placeholder="Long description of the exam here! You can use Markdown!"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="columns">
            <div class="column">
              <div class="field">
                <label
                  for="add-exam-date"
                  class="label"
                >
                  When
                </label>
                <div class="control">
                  <input
                    id="add-exam-date"
                    v-model="date"
                    :min="today"
                    :max="maxDate"
                    type="date"
                  >
                </div>
                <div class="control">
                  <input
                    id="add-exam-time"
                    v-model="time"
                    type="time"
                    name="time"
                  >
                </div>
              </div>
            </div>

            <div class="column">
              <div class="field">
                <label
                  for="add-exam-time-estimate"
                  class="label"
                >
                  Time Estimate (hrs)
                </label>
                <input
                  id="add-exam-time-estimate"
                  v-model.number="timeEstimate"
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
                  for="add-exam-priority"
                  class="label"
                >
                  Priority
                </label>
                <input
                  id="add-exam-priority"
                  v-model.number="priority"
                  list="add-exam-priorities"
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

                <datalist id="add-exam-priorities">
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
        <button
          class="button is-warning"
          @click="$emit('toggle-modal')"
        >
          Cancel
        </button>
        <button
          form="add-exam-form"
          class="button is-success"
          :class="{'is-loading': loading}"
        >
          Save
        </button>
      </footer>
    </div>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'ExamsModalAdd',
  props: {
    open: {
      type: Boolean,
      required: true
    }
  },
  data () {
    return {
      loading: false,
      courseCRN: this.defaultCourseCRN,
      title: '',
      description: '',
      priority: 2,
      date: moment()
        .add(7, 'days')
        .format('YYYY-MM-DD'),
      time: '18:00',
      timeEstimate: 5.0
    };
  },
  computed: {
    currentTerm () {
      return this.$store.getters.currentTerm;
    },
    maxDate () {
      return moment(this.currentTerm.end).format('YYYY-MM-DD');
    },
    defaultCourseCRN () {
      return this.$store.state.addExamModal.courseCRN;
    },
    dateString () {
      return this.$store.getters.addExamModalDateString;
    },
    timeString () {
      return this.$store.getters.addExamModalTimeString;
    },
    courses () {
      return this.$store.getters.current_schedule;
    },
    today: () => moment().format('YYYY-MM-DD')
  },
  watch: {
    dateString () {
      this.date = this.dateString;
    },
    timeString () {
      this.time = this.timeString;
    },
    defaultCourseCRN () {
      this.courseCRN = this.defaultCourseCRN;
    }
  },
  methods: {
    async save () {
      this.loading = true;

      let request;

      try {
        request = await this.$http.post('/exams', {
          title: this.title,
          description: this.description,
          date: moment(
            this.date + ' ' + this.time,
            'YYYY-MM-DD HH:mm',
            true
          ).toDate(),
          priority: this.priority,
          courseCRN: this.courseCRN,
          timeEstimate: this.timeEstimate
        });
      } catch (e) {
        this.$toasted.error(
          'There was an error adding the exam. Please try again later.'
        );
        this.loading = false;
        return;
      }

      // Update global state if they are not in the past
      if (
        moment(request.data.createdExam.dueDate).isAfter(
          moment().startOf('day')
        )
      ) {
        this.$store.commit(
          'ADD_UPCOMING_EXAM',
          request.data.createdExam
        );
      }

      this.title = '';
      this.description = '';
      this.timeEstimate = 3;
      this.priority = 2;

      this.loading = false;

      this.$emit('toggle-modal');

      const options = {
        action: {
          text: 'View',
          push: {
            name: 'exams-overview',
            params: { examID: request.data.createdExam._id }
          }
        }
      };

      const message = `Added exam '${
        request.data.createdExam.title
      }' due ${moment(request.data.createdExam.date).fromNow()}.`;

      this.$toasted.success(message, options);
    }
  }
};
</script>

<style lang="scss" scoped>
.add-exam-modal {
  #add-exam-description {
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
