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
                >
                  Course
                </label>
                <div class="control">
                  <select
                    id="edit-assignment-course-id"
                    v-model="assignment.courseCRN"
                    :placeholder="assignment.courseCRN"
                    name="course_crn"
                    class="input"
                  >
                    <option
                      v-for="c in courses"
                      :key="c.crn"
                      :value="c.crn"
                      :selected="c.crn === assignment.courseCRN"
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
                  for="edit-assignment-title"
                  class="label"
                >
                  Title
                </label>
                <div class="control">
                  <input
                    id="edit-assignment-title"
                    v-model="assignment.title"
                    name="title"
                    type="text"
                    class="input"
                    maxlength="200"
                  >
                </div>
              </div>
            </div>

            <div class="column">
              <div class="field">
                <label
                  for="edit-assignment-description"
                  class="label"
                >
                  Description
                </label>
                <div class="control">
                  <textarea
                    id="edit-assignment-description"
                    v-model="assignment.description"
                    name="description"
                    cols="30"
                    rows="10"
                    class="input"
                  />
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
                >
                  Due Date
                </label>
                <div class="control">
                  <input
                    id="edit-assignment-due-date"
                    v-model="assignment.dueDate"
                    :min="today"
                    :max="maxDate"
                    type="date"
                    name="due_date"
                  >
                </div>
              </div>
            </div>

            <div class="column">
              <div class="field">
                <label
                  for="edit-assignment-time"
                  class="label"
                >
                  Due Time
                </label>
                <div class="control">
                  <input
                    id="edit-assignment-time"
                    v-model="assignment.time"
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
                >
                  Time Estimate (hrs)
                </label>
                <input
                  id="edit-assignment-time-estimate"
                  v-model.number="assignment.timeEstimate"
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
                >
                  Priority
                </label>
                <input
                  id="edit-assignment-priority"
                  v-model.number="assignment.priority"
                  list="priorities"
                  type="range"
                  min="1"
                  max="10"
                  name="edit-assignment-priority"
                  step="1"
                  placeholder="0 - 10"
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
                  <option value="6" />
                  <option value="7" />
                  <option value="8" />
                  <option value="9" />
                  <option value="10" />
                </datalist>
              </div>
            </div>
          </div>
        </form>
      </section>

      <footer class="modal-card-foot">
        <span class="is-full-width">
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
          >
            Cancel
          </button>
          <button
            form="edit-assignment-form"
            class="button is-success"
            :class="{'is-loading': loading}"
            :disabled="saved"
          >
            Save
          </button>
        </span>
      </footer>
    </div>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'AssignmentsModalEdit',
  props: {
    open: {
      type: Boolean,
      required: true
    },
    initialAssignment: {
      type: Object,
      default: () => ({
        courseCRN: '',
        title: '',
        description: '',
        dueDate: moment()
          .add(1, 'days')
          .format('YYYY-MM-DD'),
        time: '08:00', // HH:mm
        timeEstimate: 1,
        priority: 5
      }),
      required: true
    }
  },
  data () {
    return {
      loading: false,
      assignment: this.convertAssignment(this.initialAssignment)
    };
  },
  computed: {
    currentTerm () {
      return this.$store.getters.term;
    },
    maxDate () {
      return moment(this.currentTerm.end).format('YYYY-MM-DD');
    },
    courses () {
      return this.$store.state.auth.user.current_schedule;
    },
    saved () {
      return (
        JSON.stringify(this.convertAssignment(this.initialAssignment)) ===
        JSON.stringify(this.assignment)
      );
    },
    today: () => moment().format('YYYY-MM-DD')
  },
  watch: {
    initialAssignment (newA, oldA) {
      this.assignment = this.convertAssignment(newA);
    }
  },
  methods: {
    convertAssignment (assignment) {
      const data = Object.assign({}, assignment);
      data.dueDate = moment(assignment.dueDate).format('YYYY-MM-DD');
      data.time = moment(assignment.dueDate).format('HH:mm');
      return data;
    },
    async save () {
      this.loading = true;

      const request = await this.$http.patch(
        `/assignments/a/${this.assignment._id}`,
        {
          title: this.assignment.title,
          description: this.assignment.description,
          dueDate: moment(
            this.assignment.dueDate + ' ' + this.assignment.time,
            'YYYY-MM-DD HH:mm',
            true
          ).toDate(),
          courseCRN: this.assignment.courseCRN,
          timeEstimate: this.assignment.timeEstimate,
          priority: this.assignment.priority
        }
      );

      // Calls API and updates state
      if (this.$store.getters.getUpcomingAssignmentById(this.assignment._id)) {
        this.$store.commit(
          'UPDATE_UPCOMING_ASSIGNMENT',
          request.data.updatedAssignment
        );
      }
      this.$emit('edit-assignment', this.assignment);

      this.loading = false;

      // Close modal
      this.$emit('toggle-modal');

      // Notify user
      this.$toasted.info(
        `Edited assignment '${
          request.data.updatedAssignment.title
        }' due ${moment(request.data.updatedAssignment.dueDate).fromNow()}.`,
        {
          action: {
            text: 'Undo'
          },
          icon: 'pen'
        }
      );
    }
  }
};
</script>

<style lang="scss" scoped>
.edit-assignment-modal {
  #edit-assignment-description {
    width: 100%;
    min-width: 100%;
    max-width: 500px;

    min-height: 100px;
    height: 200px;
    max-height: 500px;
  }

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
