<template>
  <div
    class="panel-block is-flex item"
    :class="itemClass"
  >
    <span class="item-title">{{ item.title }}</span>

    <b-numberinput
      :min="0"
      :max="item.count"
      :value="item.progress"
      @input="updateItemProgress"
    />
  </div>
</template>

<script>
export default {
  name: 'MoveInChecklistCategoryItem',
  props: {
    categoryIndex: {
      type: Number,
      required: true
    },
    itemIndex: {
      type: Number,
      required: true
    },
    item: {
      type: Object,
      required: true
    }
  },
  computed: {
    itemClass () {
      if (this.item.progress === 0) return '';
      else if (this.item.progress === this.item.count) {
        return 'completed';
      }
      return 'in-progress';
    }
  },
  methods: {
    updateItemProgress (progress) {
      this.$store.dispatch('UPDATE_CHECKLIST_ITEM', {
        categoryIndex: this.categoryIndex,
        itemIndex: this.itemIndex,
        updates: { progress }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.item {
  .item-title {
    flex: 1;
  }

  input {
    margin: 0;
  }

  border-left: 3px solid rgb(255, 175, 175);
  &.completed {
    border-left: 3px solid lightgreen;
  }
  &.in-progress {
    border-left: 3px solid rgb(255, 253, 163);
  }
}
</style>
