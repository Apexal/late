<!-- Tools: Move-in page category module-->
<template>
  <details
    class="panel category"
    open
  >
    <summary class="panel-heading has-background-dark has-text-white is-unselectable">
      {{ category.title }}
      <i
        v-if="editing"
        class="delete is-pulled-right"
        @click.stop="deleteCategory"
      />
      <b-tag
        :type="categoryTagType"
        class="is-pulled-right"
      >
        {{ category.items.length }} items
        <span v-if="!viewing && !editing">
          / {{ Math.round(progress) }}%
        </span>
      </b-tag>
    </summary>
    <div
      v-if="editing"
      class="panel-block"
    >
      <form
        class="is-fullwidth"
        @submit.prevent="addItem"
      >
        <b-field>
          <input
            :id="`category-${categoryIndex}-new-item-title`"
            ref="new-item-title"
            v-model.trim="newItem.title"
            class="input is-small"
            type="text"
            placeholder="Name of new item"
            expanded
            required
          >
          <b-input
            v-model.number="newItem.count"
            type="number"
            min="0"
            max="100"
            placeholder="# needed"
            required
          />
          <p class="control">
            <button class="button">
              Add
            </button>
          </p>
        </b-field>
      </form>
    </div>
    <Draggable
      v-model="items"
      :disabled="!editing"
      :group="`category-${categoryIndex}-items`"
    >
      <Item
        v-for="(item, index) in category.items"
        :key="index"
        :category-index="categoryIndex"
        :item-index="index"
        :item="item"
        :editing="editing"
        :viewing="viewing"
      />
    </Draggable>
    <div
      v-if="!editing && category.items.length === 0"
      class="panel-block has-text-grey"
    >
      There are no items in this category! <span v-if="!viewing">Add them in edit mode.</span>
    </div>
  </details>
</template>

<script>
import Draggable from 'vuedraggable'

import MoveInChecklistCategoryItem from './MoveInChecklistCategoryItem'

export default {
  name: 'MoveInChecklistCategory',
  components: { Draggable, Item: MoveInChecklistCategoryItem },
  props: {
    open: {
      type: Boolean,
      default: true
    },
    editing: {
      type: Boolean,
      required: true
    },
    categoryIndex: {
      type: Number,
      required: true
    },
    category: {
      type: Object,
      required: true
    },
    viewing: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      newItem: {
        title: '',
        count: 1
      }
    }
  },
  computed: {
    items: {
      get () {
        return this.category.items
      },
      set (newItems) {
        this.$store.commit('SET_CHECKLIST_CATEGORY_ITEMS', { categoryIndex: this.categoryIndex, items: newItems })
      }
    },
    progress () {
      if (this.category.items.length === 0) return 0

      const completedCount = this.category.items.filter(i => i.complete).length

      return (completedCount / this.category.items.length) * 100
    },
    categoryTagType () {
      if (this.viewing || this.editing) return 'is-white'
      if (this.progress === 100) return 'is-success'
      if (this.progress > 0) return 'is-warning'
      return 'is-danger'
    }
  },
  methods: {
    deleteCategory () {
      if (this.category.items.length === 0) {
        this.$store.commit('REMOVE_CHECKLIST_CATEGORY', {
          categoryIndex: this.categoryIndex
        })
      } else {
        // Confirm first
        this.$dialog.confirm({
          message: `Remove <b>${this.category.title}</b> and its <b>${this.category.items.length}</b> items?`,
          onConfirm: () => this.$store.commit('REMOVE_CHECKLIST_CATEGORY', {
            categoryIndex: this.categoryIndex
          })
        })
      }
    },
    addItem () {
      this.$store.commit('ADD_CHECKLIST_ITEM', {
        categoryIndex: this.categoryIndex,
        item: this.newItem
      })
      this.newItem = {
        title: '',
        count: 1
      }

      this.$refs['new-item-title'].focus()
    }
  }
}
</script>

<style lang="scss" scoped>
.panel-heading {
  cursor: pointer;
}
</style>
