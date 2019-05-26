<template>
  <details class="panel category">
    <summary class="panel-heading">
      <div class="padded">
        {{ category.title }}
      </div>
      <progress
        :value="progress"
        class="progress is-small is-primary"
        max="100"
      >
        {{ progress }}%
      </progress>
    </summary>
    <div class="panel-block">
      <form @submit.prevent="addItem">
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
    />
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
      return (
        (this.category.items.filter(item => item.count === item.progress)
          .length /
        this.category.items.length) *
        100
      );
    }
  },
  methods: {
    addItem () {
      this.$store.commit('ADD_CHECKLIST_ITEM', {
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
  padding: 0;
  cursor: pointer;
  .padded {
    padding: 0.5em 0;
    display: inline-block;
  }

  progress {
    border-radius: 0;
  }
}
</style>
