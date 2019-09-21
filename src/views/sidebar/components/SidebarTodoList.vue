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
            @click.native="isShowingAllTodos = true"
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
      title="Click to mark completed."
      @click="setTodoCompletionStatus(t, !t.completed)"
    >
      <span class="is-fullwidth">
        <small class="todo-time is-pulled-right has-text-grey">{{ fromNow(t.createdAt) }}</small>
        {{ t.text }}
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

    <!-- Completed tasks modal -->
    <b-modal
      has-modal-card
      class="modal tours-modal"
      :active.sync="isShowingAllTodos"
    >
      <div class="modal-card">
        <header class="modal-card-head">
          <p class="modal-card-title">
            Completed Tasks
          </p>
        </header>
        <section class="modal-card-body">
          <p class="has-text-grey block">
            Completed tasks are archived after 30 days.
          </p>

          <div v-if="getCompletedTodos().length > 0">
            <div
              v-for="(t, index) in getCompletedTodos()"
              :key="index"
              class="todo"
            >
              <b-field>
                <h3
                  class="is-fullwidth is-size-5 is-bold"
                  title="Click to mark as incomplete."
                  @click="setTodoCompletionStatus(t, !t.completed)"
                >
                  {{ t.text }}
                </h3>
                <b-button
                  title="Delete this item"
                  type="is-danger"
                  icon-left="trash"
                  @click="removeTodo(t)"
                />
              </b-field>
            </div>
          </div>
          <div v-else>
            <h4 class="is-size-4 no-cleared-todos">
              <b-icon
                icon="bed"
                size="is-medium"
                type="is-primary"
                class="no-cleared-todos-bed"
              />
              You haven't completed anything. Get to work!
            </h4>
          </div>
        </section>
        <footer class="modal-card-foot">
          <b-button
            type="is-primary"
            @click="isShowingAllTodos = false"
          >
            Close
          </b-button>
        </footer>
      </div>
    </b-modal>
  </div>
</template>

<script>
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
     * Set whether a specific todo list item is completed or not
     * @param todo Item to set status for. Assumed to not be null
     * @param status {boolean} status to set this todo item to
     * @returns {Promise<void>} void
     */
    async setTodoCompletionStatus (todo, status) {
      todo.completed = status
      await this.$store.dispatch('UPDATE_TODO', todo)
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
     * @returns {Promise<void>} void
     */
    async removeTodo (todo) {
      this.$buefy.dialog.confirm({
        message: `Permanently remove <i>${todo.text}</i>?`,
        onConfirm: async () => {
          try {
            await this.$store.dispatch('REMOVE_TODO', todo)
            this.$buefy.toast.open({
              message: `Completed to-do '${todo.text}'.`,
              type: 'is-success'
            })
          } catch (e) {
            this.$buefy.toast.open({
              message: e.response.data.message,
              type: 'is-danger'
            })
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
  padding: 10px;

  .todo-time {
    position: relative;
    right: -8px;
    top: -8px;
  }

  &:hover {
    background-color: hsl(0, 0%, 96%);
    .incomplete {
      text-decoration: line-through;
    }
  }
}

.no-cleared-todos {
  text-align: center;
  .no-cleared-todos-bed {
    width: 100% !important;
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
