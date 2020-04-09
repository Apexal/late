<template>
  <div class="assignment-tasks content">
    <ol v-if="assessment.tasks.length > 0">
      <Draggable
        v-model="tasks"
        @change="updateTasks"
      >
        <li
          v-for="task in tasks"
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
      tasks: [],
      newTaskText: ''
    }
  },
  watch: {
    'assessment.tasks' (newTasks) {
      this.tasks = newTasks
    }
  },
  mounted () {
    this.tasks = this.assessment.tasks
  },
  methods: {
    async updateTasks () {
      let updatedAssessment
      try {
        updatedAssessment = await this.$store.dispatch('UPDATE_ASSESSMENT', {
          assessmentID: this.assessment._id,
          assessmentType: this.assessment.assessmentType,
          updates: { tasks: this.tasks }
        })
      } catch (e) {
        return this.showError(e.response.data.message)
      }

      this.$emit('updated-assessment', updatedAssessment)
    },
    async addTask () {
      this.loading = true

      const newTask = { text: this.newTaskText, addedAt: new Date() }
      this.tasks = [...this.tasks, newTask]

      this.updateTasks()

      this.newTaskText = ''

      this.$buefy.toast.open({
        message: 'Added task.',
        type: 'is-success'
      })

      this.loading = false
    },
    async toggleTask (taskID) {
      const task = this.tasks.find(task => task._id === taskID)
      task.completed = !task.completed
      task.completedAt = (task.completed ? new Date() : undefined)

      this.updateTasks()
    },
    async deleteTask (taskID) {
      this.tasks = this.tasks.filter(task => task._id !== taskID)

      this.updateTasks()
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
