<template>
  <details class="panel category">
    <summary
      class="panel-heading"
    >
      {{ category.title }}
      <span class="delete is-pulled-right">delete</span>
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
      :item="item"
      @add-item="addItem"
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
  methods: {
    addItem () {
      this.$emit('add-item', this.newItem);
      this.newItem = {
        title: '',
        count: 1
      };
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
