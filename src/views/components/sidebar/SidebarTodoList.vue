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
    <div class="sidebar-body">
      <div
        v-for="(t, index) in todos"
        :key="index"
        class="panel-block todo"
        title="Click to mark completed."
        @click="removeTodo(t)"
      >
        <span class="is-full-width">
          <small class="todo-time is-pulled-right has-text-grey is-size-7">
            {{ fromNow(t.addedAt) }}
          </small>
          {{ t.text }}
        </span>
      </div>
    </div>
    <div
      v-if="todos.length === 0"
      class="panel-block has-text-grey-light"
    >
      No to-dos saved on this device yet.
    </div>
  </div>
</template>

<script>
import moment from 'moment';

export default {
  name: 'SidebarTodoList',
  data () {
    return {
      newTodo: '',
      todos: []
    };
  },
  computed: {
    now () {
      return this.$store.state.now;
    }
  },
  async created () {
    await this.$store.dispatch('GET_TODOS');
    this.todos = this.$store.getters.todos;
  },
  updated () {
    this.todos = this.$store.getters.todos;
  },
  methods: {
    fromNow (date) {
      return moment(date).from(this.now);
    },
    async addTodo () {
      if (!this.newTodo) return;

      const todo = {
        text: this.newTodo,
        addedAt: new Date()
      };
      let response;
      try {
        response = await this.$store.dispatch('ADD_TODO', todo);
        this.$toasted.show(`Added to-do '${this.newTodo}'.`, {
          icon: 'list-ol',
          action: {
            text: 'Undo'
          }
        });
        this.newTodo = '';
      } catch (e) {
        this.$toasted.error(e.response.data.message);
      }
    },
    removeTodo (todo) {
      if (!confirm(`Done with '${todo.text}'?`)) return;

      // TODO
      return false;

      // this.todos.splice(this.todos.indexOf(todo), 1);
      // this.saveTodos();
      // this.$toasted.show(`Completed to-do '${todo.text}'.`, {
      //   icon: 'times',
      //   action: {
      //     text: 'Undo'
      //   }
      // });
    } // ,
    // saveTodos () {
    //   // const parsed = JSON.stringify(this.todos);
    //   // localStorage.setItem('todos', parsed);
    //   // this.$emit('update-count', { tab: 'todos', count: this.todos.length });
    // }
  }
};
</script>

<style lang="scss" scoped>
.todo {
  cursor: pointer;

  .todo-time {
    position: relative;
    right: -8px;
    top: -8px;
  }

  .hover-check {
    padding-left: -5px;
    visibility: hidden;
  }
  &:hover {
    background-color: hsl(0, 0%, 96%);

    text-decoration: line-through;
  }
}
</style>
