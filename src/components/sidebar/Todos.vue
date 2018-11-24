<template>
  <details class="todos panel">
    <summary class="panel-heading is-unselectable is-size-6">
      <span class="tag is-dark is-pulled-right">{{ todos.length }}</span>
      TODOs
    </summary>
    <form @submit.prevent="addTodo">
      <input
        v-model="newTodo"
        class="is-small is-full-width"
        type="text"
        placeholder="Add todo"
        required
      >
    </form>
    <div
      v-for="(t, index) in todos"
      :key="index"
      class="panel-block todo is-size-7"
      title="Click to remove."
      @click="removeTodo(t)"
    >
      {{ t }}
    </div>
    <div
      v-if="todos.length === 0"
      class="panel-block has-text-grey-light is-size-7"
    >
      No todos saved on this device yet.
    </div>
  </details>
</template>

<script>
export default {
  name: 'TODOs',
  data () {
    return {
      newTodo: '',
      todos: []
    };
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
    addTodo () {
      if (!this.newTodo) return;

      this.todos.push(this.newTodo);
      this.newTodo = '';
      this.saveTodos();
    },
    removeTodo (todo) {
      this.todos.splice(this.todos.indexOf(todo), 1);
      this.saveTodos();
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
  cursor: pointer;
  &:hover {
    background-color: hsl(0, 0%, 96%);
  }
}
</style>
