<!--Sidebar: To-do list module-->
<template>
  <div class="todos">
    <form @submit.prevent="addTodo">
      <div class="control panel-block">
        <b-field class="is-fullwidth">
          <label class="is-fullwidth">
            <input
              v-model.trim="newTodo"
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
      v-for="(t, index) in getIncompletedTodos()"
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
          @click="setTodoCompletionStatus(t, !t.completed)"
        >
          {{ t.text }}
        </span>
      </span>
    </div>
    <div
      v-if="getIncompletedTodos().length === 0"
      class="no-todo"
    >
      <i class="far fa-sticky-note no-todo-icon" />
      <div class="panel-block has-text-grey-light no-hover">
        No to-dos saved yet.
      </div>
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
      newTodo: '',
      isShowingAllTodos: false
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
        props: { items: this.getCompletedTodos() },
        events: { 'delete-todo': this.removeTodo, 'uncheck-todo': (t) => this.setTodoCompletionStatus(t, false) }
      })
    },
    /**
     * Get all of the todo list items that are NOT completed
     * @returns {[]} Array of all items in {@link this.todos} which are NOT completed
     */
    getIncompletedTodos () {
      const incompletedTodos = []
      for (let i = 0; i < this.todos.length; i++) {
        if (!this.todos[i].completed) {
          incompletedTodos.push(this.todos[i])
        }
      }
      return incompletedTodos
    },
    /**
     * Get all of the todo list items that are completed
     * @returns {[]} Array of all items in {@link this.todos} which are completed
     */
    getCompletedTodos () {
      const completedTodos = []
      for (let i = 0; i < this.todos.length; i++) {
        if (this.todos[i].completed) {
          completedTodos.push(this.todos[i])
        }
      }
      return completedTodos
    },
    /**
     * Set the todo text value to the provided text
     * @param todo Todo to change text for. Expected to be non-null
     * @param text Text to set on todo. Expected to be non-null
     */
    async setTodoValue (todo, text) {
      todo.text = text
      try {
        await this.$store.dispatch('UPDATE_TODO', todo)
        this.$buefy.toast.open({
          type: 'is-success',
          message: `Changed to-do to '${text}'.`
        })
      } catch (e) {
        this.$buefy.toast.open({
          message: e.response.data.message,
          type: 'is-danger'
        })
      }
    },
    /**
     * Set whether a specific todo list item is completed or not
     * @param todo Item to set status for. Assumed to not be null
     * @param status {boolean} status to set this todo item to
     * @returns {Promise<void>} void
     */
    async setTodoCompletionStatus (todo, status) {
      todo.completed = status
      try {
        await this.$store.dispatch('UPDATE_TODO', todo)
        if (status) {
          this.$buefy.toast.open({
            type: 'is-success',
            message: `Completed to-do '${todo.text}'.`
          })
        }
      } catch (e) {
        this.$buefy.toast.open({
          message: e.response.data.message,
          type: 'is-danger'
        })
      }
    },
    /**
     * Adds whatever value is in {@link this.newTodo} to the todo list.
     * @returns {Promise<void>} void
     */
    async addTodo () {
      if (!this.newTodo) return

      try {
        await this.$store.dispatch('ADD_TODO', this.newTodo)
        this.$buefy.toast.open({
          type: 'is-success',
          message: `Added to-do '${this.newTodo}'.`
        })
        this.newTodo = ''
      } catch (e) {
        this.$buefy.toast.open({
          message: e.response.data.message,
          type: 'is-danger'
        })
      }
    },
    /**
     * Remove the provided todo item from the todo list
     * @param todo Todo item to remove. Assumed to be non-null
     * @param callback Callback function that is called only if the user confirms the removal.
     * @returns {Promise<void>} void
     */
    async removeTodo (todo, callback) {
      this.$buefy.dialog.confirm({
        message: `Permanently remove <i>${todo.text}</i>?`,
        onConfirm: async () => {
          try {
            await this.$store.dispatch('REMOVE_TODO', todo)
          } catch (e) {
            this.$buefy.toast.open({
              message: e.response.data.message,
              type: 'is-danger'
            })
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
  }

  &:hover {
    background-color: hsl(0, 0%, 96%);
    .incomplete {
      text-decoration: line-through;
    }
  }
}

.no-todo {
  i {
    width: 100%;
    text-align: center;
    font-size: 4em;
    padding: 15px 0px 5px 0px;
    display: block;
    color: rgba(128, 128, 128, 0.5);

    border-left: 1px solid #dbdbdb;
    border-right: 1px solid #dbdbdb;
  }

  div {
    display: block;
    width: 100%;
    text-align: center;
  }
}
</style>
