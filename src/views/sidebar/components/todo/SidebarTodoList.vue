<!--Sidebar: To-do list module-->
<template>
  <div class="todos">
    <form @submit.prevent="addTodo">
      <div class="control panel-block">
        <b-field class="is-fullwidth">
          <label class="is-fullwidth">
            <input
              v-model.trim="newTodoText"
              class="input is-small"
              type="text"
              placeholder="Add to-do"
              required
            >
          </label>
          <b-tooltip
            label="Show completed"
            type="is-light"
            animated
            style="cursor: pointer;"
            :delay="500"
            @click.native="openCompletedModal"
          >
            <b-icon
              class="is-inline-block is-centered"
              style="margin-left: 1em;"
              icon="ellipsis-v"
              size="is-small"
            />
          </b-tooltip>
        </b-field>
      </div>
    </form>
    <div
      v-for="(t, index) in incompletedTodos"
      :key="index"
      class="panel-block todo incomplete"
    >
      <span class="is-fullwidth">
        <small class="todo-time is-pulled-right has-text-grey">
          {{ fromNow(t.createdAt) }}
          <b-icon
            icon="edit"
            size="is-small"
            @click.native="openEditModal(t)"
          />
        </small>
        <span
          class="is-fullwidth is-fullheight is-block todo-text"
          title="Click to mark completed."
          @click="setTodoCompletionStatus(t, Date.now())"
        >
          {{ t.text }}
        </span>
      </span>
    </div>
    <div
      v-if="incompletedTodos.length === 0"
      class="panel-block has-text-grey no-items"
    >
      <i class="far fa-sticky-note no-items-icon" />
      No to-dos saved yet.
    </div>
  </div>
</template>

<script>
import TodoListCompletedModal from './TodoListCompletedModal'
import TodoListEditModal from './TodoListEditModal'

export default {
  name: 'SidebarTodoList',
  props: {
    todos: { type: Array, required: true }
  },
  data () {
    return {
      newTodoText: '',
      isShowingAllTodos: false
    }
  },
  computed: {
    incompletedTodos () {
      return this.todos.filter(t => t.completed === null)
    },
    completedTodos () {
      return this.todos.filter(t => t.completed !== null)
    }
  },
  methods: {
    /**
     * Open the edit modal to edit the passed todo item
     * @param t Todo object. Expected to be non-null
     */
    openEditModal (t) {
      this.$buefy.modal.open({
        parent: this,
        component: TodoListEditModal,
        hasModalCard: true,
        props: { item: t },
        events: { 'delete-todo': this.removeTodo, 'save-todo': (t, value) => this.setTodoValue(t, value) }
      })
    },
    /**
     * Open the modal listing all completed todo list items
     */
    openCompletedModal () {
      this.$buefy.modal.open({
        parent: this,
        component: TodoListCompletedModal,
        hasModalCard: true,
        props: { items: this.completedTodos },
        events: { 'delete-todo': this.removeTodo, 'uncheck-todo': (t) => this.setTodoCompletionStatus(t, null) }
      })
    },
    /**
     * Set the todo text value to the provided text
     * @param todo Todo to change text for. Expected to be non-null
     * @param text Text to set on todo. Expected to be non-null
     */
    async setTodoValue (todo, text) {
      try {
        await this.$store.dispatch('UPDATE_TODO', { todoID: todo.id, updates: { text } })
        this.$buefy.toast.open({
          type: 'is-success',
          message: `Changed to-do to '${text}'.`
        })
      } catch (e) {
        this.showError(e.response.data.message)
      }
    },
    /**
     * Set whether a specific todo list item is completed or not
     * @param todo Item to set status for. Assumed to not be null
     * @param completedAt {Date|null} Datetime of when this todo was completed. Null if incomplete
     * @returns {Promise<void>} void
     */
    async setTodoCompletionStatus (todo, completed) {
      try {
        await this.$store.dispatch('UPDATE_TODO', { todoID: todo.id, updates: { completed } })
        if (completed) {
          this.$buefy.toast.open({
            type: 'is-success',
            message: `Completed to-do '${todo.text}'.`
          })
        }
      } catch (e) {
        this.showError(e.response.data.message)
      }
    },
    /**
     * Adds whatever value is in {@link this.newTodoText} to the todo list.
     * @returns {Promise<void>} void
     */
    async addTodo () {
      if (!this.newTodoText) return

      const split = this.newTodoText.split('and')
      split.forEach(this.addTodoFromArray)
    },
    async addTodoFromArray (todoText) {
      try {
        await this.$store.dispatch('ADD_TODO', todoText)
        this.$buefy.toast.open({
          type: 'is-success',
          message: `Added to-do '${todoText}'.`
        })
        this.newTodoText = '' // reset global todo string
      } catch (e) {
        this.showError(e.response.data.message)
      }
    },
    /**
     * Remove the provided todo item from the todo list
     * @param todo Todo item to remove. Assumed to be non-null
     * @param callback Callback function that is called only if the user confirms the removal.
     * @returns {Promise<void>} void
     */
    removeTodo (todo, callback) {
      this.$buefy.dialog.confirm({
        message: `Permanently remove <i>${todo.text}</i>?`,
        onConfirm: async () => {
          try {
            await this.$store.dispatch('REMOVE_TODO', todo)
          } catch (e) {
            this.showError(e.response.data.message)
          }
          if (callback) {
            callback()
          }
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.todo {
  cursor: pointer;
  padding: 0 15px 0 0;

  .todo-text {
    padding: 10px;
  }

  .todo-time {
    position: relative;
    right: -13px;
    padding: 10px;
  }

  &:hover {
    background-color: hsl(0, 0%, 96%);
    .incomplete {
      text-decoration: line-through;
    }
  }
}
</style>
