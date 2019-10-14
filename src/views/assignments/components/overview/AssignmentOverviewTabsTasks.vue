<template>
  <div class="assignment-tasks content">
    <ol v-if="assessment.tasks.length > 0">
      <li
        v-for="task in assessment.tasks"
        :key="task.id"
        class="task"
      >
        <b-checkbox>{{ task.text }}</b-checkbox>
        <span
          class="delete"
          @click="deleteTask(task._id)"
        />
      </li>
    </ol>
    <p
      v-else
      class="has-text-centered has-text-grey"
    >
      No tasks have been added yet.
    </p>
    <hr>

    <form @submit.prevent="addTask">
      <input
        v-model.trim="newTaskText"
        class="input"
        minlength="3"
        maxlength="200"
        type="text"
        placeholder="New task"
        required
      >
      <b-button type="submit">
        Add
      </b-button>
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
      newTaskText: ''
    }
  },
  methods: {
    async addTask () {
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
        return
      }

      this.$emit('updated-assessment', updatedAssessment)

      this.newTaskText = ''

      this.$buefy.toast.open({
        message: 'Added task.',
        type: 'is-success'
      })
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
