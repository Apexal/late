<template>
  <div class="modal-card">
    <b-loading
      :active="isFetchingAll"
      :is-full-page="false"
      :can-cancel="false"
    />
    <header class="modal-card-head">
      <p class="modal-card-title">
        Completed Tasks
      </p>
    </header>
    <section class="modal-card-body">
      <p class="has-text-grey block">
        Completed tasks are archived after 30 days.
        <a
          v-if="!isShowingAll"
          @click="showAll"
        >
          Show all
        </a>
      </p>

      <div v-if="items.length > 0">
        <div
          v-for="(t, index) in items"
          :key="index"
          class="item"
        >
          <b-field>
            <h3
              class="is-fullwidth is-size-5 is-bold"
              :title="'Completed ' + fromNow(t.completed) + '. Click to mark as incomplete.'"
              @click="uncheckItem(t)"
            >
              {{ t.text }}
            </h3>
            <b-button
              title="Delete this item"
              type="is-danger"
              icon-left="trash"
              @click="deleteItem(t)"
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
        @click="$parent.close()"
      >
        Close
      </b-button>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'TodoListCompletedModal',
  props: {
    items: { type: Array, required: true }
  },
  data () {
    return {
      isFetchingAll: false,
      isShowingAll: false
    }
  },
  methods: {
    deleteItem (t) {
      this.$emit('delete-todo', t, () => {
        this.items = this.items.filter((t1) => t1._id !== t._id)
      })
    },
    uncheckItem (t) {
      this.items = this.items.filter((t1) => t1._id !== t._id)
      this.$emit('uncheck-todo', t)
    },
    async showAll () {
      this.isFetchingAll = true
      let response
      try {
        response = await this.$http.get('/todos/all')
      } catch (e) {
        this.showError(e.response.data.message)
        this.isFetchingAll = false
        return
      }

      if (response.data && response.data.todos) {
        this.items = response.data.todos.filter((t) => t.completed !== null)
      }
      this.isShowingAll = true
      this.isFetchingAll = false
    }
  }
}
</script>

<style lang="scss" scoped>
.item {
  padding: 10px;
  &:hover {
    background-color: hsl(0, 0, 96%);
    cursor: pointer;
  }
}
.no-cleared-todos {
  text-align: center;
  .no-cleared-todos-bed {
    width: 100% !important;
  }
}
</style>
