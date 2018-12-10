<template>
  <div
    :class="{'is-active': open}"
    class="add-assignment-modal modal"
  >
    <div
      class="modal-background"
      @click="$emit('toggle-modal')"
    />
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">
          Add Assignment
        </p>
      </header>

      <section class="modal-card-body">
        <form
          id="add-assignment-form"
          class="form"
          @submit.prevent="save"
        >
          <div class="columns is-multiline">
            <div class="column is-half">
              <div class="field">
                <label
                  for="course-id"
                  class="label"
                >
                  Course
                </label>
                <div class="control">
                  <select
                    id="course-id"
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
                  for="title"
                  class="label"
                >
                  What do you have to do?
                </label>
                <div class="control">
                  <input
                    id="title"
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
                  for="description"
                  class="label"
                >
                  Description
                </label>
                <div class="control">
                  <textarea
                    id="description"
                    v-model.trim="description"
                    cols="30"
                    rows="10"
                    class="input"
                    placeholder="Long description of the assignment here! You can use Markdown!"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="columns">
            <div class="column">
              <div class="field">
                <label
                  for="due-date"
                  class="label"
                >
                  Due Date
                </label>
                <div class="control">
                  <input
                    id="due-date"
                    v-model="dueDate"
                    :min="today"
                    max="2030-01-01"
                    type="date"
                  >
                </div>
              </div>
            </div>

            <div class="column">
              <div class="field">
                <label
                  for="time"
                  class="label"
                >
                  Due Time
                </label>
                <div class="control">
                  <input
                    id="time"
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
                  for="time-estimate"
                  class="label"
                >
                  Time Estimate (hrs)
                </label>
                <input
                  id="time-estimate"
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
                  for="priority"
                  class="label"
                >
                  Priority
                </label>
                <input
                  id="priority"
                  v-model.number="priority"
                  list="priorities"
                  type="range"
                  min="1"
                  max="10"
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

                <datalist id="priorities">
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
        <button
          class="button is-warning"
          @click="$emit('toggle-modal')"
        >
          Cancel
        </button>
        <button
          form="add-assignment-form"
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
  name: 'AddAssignmentModal',
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
      dueDate: moment()
        .add(1, 'days')
        .format('YYYY-MM-DD'),
      time: '08:00', // HH:mm
      timeEstimate: 1.0,
      priority: 5
    };
  },
  computed: {
    defaultCourseCRN () {
      return this.$store.state.addAssignmentModal.courseCRN;
    },
    dueDateString () {
      return this.$store.getters.addAssignmentModalDueDateString;
    },
    dueTimeString () {
      return this.$store.getters.addAssignmentModalDueTimeString;
    },
    courses () {
      return this.$store.state.auth.user.current_schedule;
    },
    today: () => moment().format('YYYY-MM-DD')
  },
  watch: {
    dueDateString () {
      this.dueDate = this.dueDateString;
    },
    dueTimeString () {
      this.time = this.dueTimeString;
    },
    defaultCourseCRN () {
      this.courseCRN = this.defaultCourseCRN;
    }
  },
  methods: {
    async save () {
      this.loading = true;
      // TODO: error handle
      const request = await this.$http.post('/assignments/create', {
        title: this.title,
        description: this.description,
        dueDate: moment(
          this.dueDate + ' ' + this.time,
          'YYYY-MM-DD HH:mm',
          true
        ).toDate(),
        courseCRN: this.courseCRN,
        timeEstimate: this.timeEstimate,
        priority: this.priority
      });

      // Calls API and updates state
      await this.$store.dispatch(
        'ADD_UPCOMING_ASSIGNMENT',
        request.data.createdAssignment
      );

      // Reset important fields
      this.title = '';
      this.description = '';
      this.timeEstimate = 0;
      this.priority = 1.0;

      this.loading = false;

      // Close modal
      this.$emit('toggle-modal');

      // Notify user
      this.$toasted.success(
        `Added assignment '${
          request.data.createdAssignment.title
        }' due ${moment(request.data.createdAssignment.dueDate).fromNow()}.`,
        {
          icon: 'plus',
          action: {
            text: 'View',
            push: {
              name: 'assignments-overview',
              params: { assignmentID: request.data.createdAssignment._id }
            }
          }
        }
      );
    }
  }
};
</script>

<style lang="scss" scoped>
.add-assignment-modal {
  #description {
    width: 100%;
    min-width: 100%;
    max-width: 500px;

    min-height: 100px;
    height: 200px;
    max-height: 500px;
  }
}
</style>
