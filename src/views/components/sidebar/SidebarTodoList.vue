<template>
  <div class="todos">
    <form @submit.prevent="addTodo">
      <div class="control panel-block">
        <input
          v-model.trim="newTodo"
          class="input is-small"
          type="text"
          placeholder="Add to-do"
          required
        >
      </div>
    </form>
    <div
      v-for="(t, index) in todos"
      :key="index"
      class="panel-block todo"
      title="Click to mark completed."
      @click="removeTodo(t)"
    >
      <span class="is-fullwidth">
        <small class="todo-time is-pulled-right has-text-grey">
          {{
            fromNow(t.addedAt)
          }}
        </small>
        {{ t.text }}
      </span>
    </div>
    <div
      v-if="todos.length === 0"
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
export default {
  name: 'SidebarTodoList',
  props: {
    todos: { type: Array, required: true }
  },
  data () {
    return {
      newTodo: ''
    };
  },
  computed: {
    now () {
      return this.$store.state.now;
    }
  },
  methods: {
    async addTodo () {
      if (!this.newTodo) return;

      try {
        await this.$store.dispatch('ADD_TODO', this.newTodo);
        this.$toasted.show(`Added to-do '${this.newTodo}'.`);
        this.newTodo = '';
      } catch (e) {
        this.$toasted.error(e.response.data.message);
      }
    },
    async removeTodo (todo) {
      this.$dialog.confirm({
        message: `Done with <i>${todo.text}</i>?`,
        onConfirm: async () => {
          try {
            await this.$store.dispatch('REMOVE_TODO', todo);
            this.$toast.open({
              message: `Completed to-do '${todo.text}'.`,
              type: 'is-success'
            });
          } catch (e) {
            this.$toast.open({
              message: e.response.data.message,
              type: 'is-danger'
            });
          }
        }
      });
    }
  }
};
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
    text-decoration: line-through;
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
