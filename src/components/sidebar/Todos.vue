<template>
  <details class="todos panel">
    <summary class="panel-heading is-unselectable is-size-6">
      <span
        v-if="todos.length > 0"
        class="tag is-dark is-pulled-right"
      >
        {{ todos.length }}
      </span>
      To-Do List
    </summary>
    <form @submit.prevent="addTodo">
      <div class="control panel-block">
        <input
          v-model="newTodo"
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
      class="panel-block todo is-size-7"
      title="Click to mark completed."
      @click="removeTodo(t)"
    >
      <span class="is-full-width">
        <span class="icon hover-check">
          <i class="fa fa-check" />
        </span>
        <small class="is-pulled-right has-text-grey">
          {{ fromNow(t.addedAt) }}
        </small>
        {{ t.text }}
      </span>
    </div>
    <div
      v-if="todos.length === 0"
      class="panel-block has-text-grey-light is-size-7"
    >
      No to-dos saved on this device yet.
    </div>
  </details>
</template>

<script>
import moment from 'moment';

export default {
  name: 'TODOs',
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
  mounted () {
    if (localStorage.getItem('todos')) {
      try {
        this.todos = JSON.parse(localStorage.getItem('todos'));
      } catch (e) {
        localStorage.removeItem('todos');
      }
    }
  },
  methods: {
    fromNow (date) {
      return moment(date).from(this.now);
    },
    addTodo () {
      if (!this.newTodo) return;

      this.todos.push({ text: this.newTodo, addedAt: new Date() });
      this.saveTodos();
      this.$toasted.show(`Added to-do '${this.newTodo}'.`, {
        icon: 'list-ol',
        action: {
          text: 'Undo'
        }
      });
      this.newTodo = '';
    },
    removeTodo (todo) {
      if (!confirm(`Done with '${todo.text}'?`)) return;

      this.todos.splice(this.todos.indexOf(todo), 1);
      this.saveTodos();
      this.$toasted.show(`Completed to-do '${todo.text}'.`, {
        icon: 'times',
        action: {
          text: 'Undo'
        }
      });
    },
    saveTodos () {
      const parsed = JSON.stringify(this.todos);
      localStorage.setItem('todos', parsed);
    }
  }
};
</script>

<style lang="scss" scoped>
.todo {
  .hover-check {
    display: none;
  }
  cursor: pointer;
  &:hover {
    background-color: hsl(0, 0%, 96%);

    .hover-check {
      display: inline;
    }
  }
}
</style>
