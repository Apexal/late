<template>
  <div class="assignment-tasks content">
    <ol v-if="assessment.tasks.length > 0">
      <li
        v-for="task in assessment.tasks"
        :key="task.id"
        class="task"
      >
        <b-checkbox
          :value="task.completed"
          @input="toggleTask(task._id)"
        >
          {{ task.text }}
        </b-checkbox>
        <span
          title="Remove task"
          class="delete"
          @click="deleteTask(task._id)"
        />
      </li>
    </ol>
    <p
      v-else
      class="has-text-centered has-text-grey"
    >
      No tasks have been added yet. These are milestones for the assignment such as 'Problem 1, Problem 2, Problem 3' or 'Read article, Write review, Submit final copy'.
    </p>
    <hr>

    <form @submit.prevent="addTask">
      <div class="field has-addons is-expanded">
        <div
          class="control"
          style="flex: 1"
        >
          <input
            v-model.trim="newTaskText"
            class="input"
            minlength="3"
            maxlength="200"
            type="text"
            placeholder="New task"
            required
          >
        </div>
        <div class="control">
          <button
            class="button"
            type="submit"
            :class="{'is-loading': loading}"
          >
            Add Task
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
export default {
  name: 'AssignmentOverviewTabsTask',
  props: {
    assessment: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      loading: false,
      newTaskText: ''
    }
  },
  methods: {
    async addTask () {
      this.loading = true

      const newTask = { text: this.newTaskText, addedAt: new Date() }

      let updatedAssessment
      try {
        updatedAssessment = await this.$store.dispatch('UPDATE_ASSESSMENT', {
          assessmentID: this.assessment._id,
          assessmentType: this.assessment.assessmentType,
          updates: { tasks: [...this.assessment.tasks, newTask] }
        })
      } catch (e) {
        this.$buefy.toast.open({
          message: e.response.data.message,
          type: 'is-danger'
        })
        this.loading = false
        return
      }

      this.$emit('updated-assessment', updatedAssessment)

      this.newTaskText = ''

      this.$buefy.toast.open({
        message: 'Added task.',
        type: 'is-success'
      })

      this.loading = false
    },
    async toggleTask (taskID) {
      const tasks = [...this.assessment.tasks] // clone
      const task = tasks.find(task => task._id === taskID)
      task.completed = !task.completed
      task.completedAt = (task.completed ? new Date() : undefined)

      let updatedAssessment
      try {
        updatedAssessment = await this.$store.dispatch('UPDATE_ASSESSMENT', {
          assessmentID: this.assessment._id,
          assessmentType: this.assessment.assessmentType,
          updates: { tasks }
        })
      } catch (e) {
        this.$buefy.toast.open({
          message: e.response.data.message,
          type: 'is-danger'
        })
      }
    },
    async deleteTask (taskID) {
      const tasks = this.assessment.tasks.filter(task => task._id !== taskID)

      let updatedAssessment
      try {
        updatedAssessment = await this.$store.dispatch('UPDATE_ASSESSMENT', {
          assessmentID: this.assessment._id,
          assessmentType: this.assessment.assessmentType,
          updates: { tasks }
        })
      } catch (e) {
        this.$buefy.toast.open({
          message: e.response.data.message,
          type: 'is-danger'
        })
        return
      }

      this.$emit('updated-assessment', updatedAssessment)
    }
  }
}
</script>

<style lang="scss" scoped>
.task {
  .delete {
    display: none;
  }

  &:hover {
    .delete {
      display: inline-block;
    }
  }
}
</style>
