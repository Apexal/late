<template>
  <form
    action=""
    @submit.prevent="saveItem(text)"
  >
    <div
      class="modal-card"
      style="width: 500px"
    >
      <header class="modal-card-head">
        <p class="modal-card-title">
          Edit Todo Item
        </p>
      </header>
      <section class="modal-card-body">
        <b-field label="Content">
          <b-input
            v-model.trim="text"
            type="text"
            placeholder="Buy groceries"
            required
          />
        </b-field>
      </section>
      <footer class="modal-card-foot">
        <b-button
          icon-left="save"
          @click="saveItem(text)"
        >
          Save
        </b-button>
        <b-button
          icon-left="trash"
          class="is-danger"
          @click="deleteItem"
        >
          Delete
        </b-button>
      </footer>
    </div>
  </form>
</template>

<script>
export default {
  name: 'TodoListEditModal',
  props: {
    item: { type: Object, required: true }
  },
  data () {
    return {
      text: this.item.text
    }
  },
  methods: {
    deleteItem () {
      this.$parent.close()
      this.$emit('delete-todo', this.item)
    },
    saveItem (newValue, evt) {
      this.$emit('save-todo', this.item, newValue)
      this.$parent.close()
    }
  }
}
</script>

<style scoped>

</style>
