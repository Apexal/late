<template>
  <div class="assignment-tasks content">
    <ol v-if="assessment.tasks.length > 0">
      <Draggable
        v-model="assessment.tasks"
        @change="orderChanged"
      >
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
      </Draggable>
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
import Draggable from 'vuedraggable'

export default {
  name: 'AssignmentOverviewTabsTask',
  components: { Draggable },
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
    async updateTasks (tasks) {
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

      this.$emit('updated-assessment', updatedAssessment)
    },
    async addTask () {
      this.loading = true

      const newTask = { text: this.newTaskText, addedAt: new Date() }

      this.updateTasks([...this.assessment.tasks, newTask])

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

      this.updateTasks(tasks)
    },
    async deleteTask (taskID) {
      const tasks = this.assessment.tasks.filter(task => task._id !== taskID)

      this.updateTasks(tasks)
    },
    async orderChanged () {
      this.updateTasks(this.assessment.tasks)
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
