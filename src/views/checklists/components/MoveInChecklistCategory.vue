<!-- Tools: Move-in page category module-->
<template>
  <details class="panel category">
    <summary class="panel-heading has-background-dark has-text-white">
      {{ category.title }}
      <i
        v-if="editing"
        class="delete is-pulled-right"
        @click="deleteCategory"
      />
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
          <b-input
            v-model.trim="newItem.title"
            placeholder="Name of item"
            expanded
            required
          />
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
    <Item
      v-for="(item, index) in category.items"
      :key="index"
      :category-index="categoryIndex"
      :item-index="index"
      :item="item"
      :editing="editing"
    />
    <div
      v-if="!editing && category.items.length === 0"
      class="panel-block has-text-grey"
    >
      There are no items in this category! Add them in edit mode.
    </div>
  </details>
</template>

<script>
import MoveInChecklistCategoryItem from './MoveInChecklistCategoryItem';

export default {
  name: 'MoveInChecklistCategory',
  components: { Item: MoveInChecklistCategoryItem },
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
    }
  },
  data () {
    return {
      newItem: {
        title: '',
        count: 1
      }
    };
  },
  computed: {
    progress () {
      if (this.category.items.length === 0) return 0;
      const totalItems = this.category.items.reduce(
        (acc, item) => acc + item.count,
        0
      );
      const totalCompletedItems = this.category.items.reduce(
        (acc, item) => acc + item.progress,
        0
      );

      return (totalCompletedItems / totalItems) * 100;
    }
  },
  methods: {
    deleteCategory () {
      this.$store.dispatch('REMOVE_CHECKLIST_CATEGORY', {
        categoryIndex: this.categoryIndex
      });
    },
    addItem () {
      this.$store.dispatch('ADD_CHECKLIST_ITEM', {
        categoryIndex: this.categoryIndex,
        item: this.newItem
      });
      this.newItem = {
        title: '',
        count: 1
      };
    }
  }
};
</script>

<style lang="scss" scoped>
.panel-heading {
  cursor: pointer;
}
</style>
