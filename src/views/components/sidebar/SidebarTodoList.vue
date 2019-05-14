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
      <span class="is-full-width">
        <small class="todo-time is-pulled-right has-text-grey">{{ fromNow(t.addedAt) }}</small>
        {{ t.text }}
      </span>
    </div>
    <div
      v-if="todos.length === 0"
      class="panel-block has-text-grey-light"
    >
      No to-dos saved yet.
    </div>
  </div>
</template>

<script>
import moment from 'moment';

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
            this.$toast.open({ message: `Deleted to-do '${todo.text}'.`, type: 'is-success' });
          } catch (e) {
            this.$toast.open({ message: e.response.data.message, type: 'is-danger' });
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
</style>
