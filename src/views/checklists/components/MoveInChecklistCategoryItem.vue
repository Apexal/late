<!--Tools: Move-in page checklist category item module-->
<template>
  <div
    class="panel-block is-flex item"
    :class="itemClass"
  >
    <span class="item-title">{{ item.title }}</span>

    <template v-if="editing">
      <input
        class=" edit-item-count"
        type="number"
        :value="item.count"
        min="0"
        max="100"
        @change="updateItemCount(+$event.target.value)"
      >
      <i
        class="delete"
        @click="removeItem"
      />
    </template>
    <template v-else>
      <span
        class="icon subtract-progress"
        :class="{ 'has-text-grey': item.progress - 1 < 0 }"
        @click="updateItemProgress(item.progress - 1)"
      >
        <i class="fas fa-minus-circle" />
      </span>
      <span>{{ item.progress }} / {{ item.count }}</span>
      <span
        class="icon add-progress"
        :class="{ 'has-text-grey': item.progress + 1 > item.count }"
        @click="updateItemProgress(item.progress + 1)"
      >
        <i class="fas fa-plus-circle" />
      </span>
    </template>
  </div>
</template>

<script>
export default {
  name: 'MoveInChecklistCategoryItem',
  props: {
    editing: {
      type: Boolean,
      required: true
    },
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
      if (progress < 0 || progress > this.item.count) return;

      this.$store.dispatch('UPDATE_CHECKLIST_ITEM', {
        categoryIndex: this.categoryIndex,
        itemIndex: this.itemIndex,
        updates: { progress }
      });
    },
    updateItemCount (count) {
      if (count < 0 || count > 100) return;

      const updates = { count };
      if (this.item.progress > count) updates.progress = count;

      this.$store.dispatch('UPDATE_CHECKLIST_ITEM', {
        categoryIndex: this.categoryIndex,
        itemIndex: this.itemIndex,
        updates
      });
    },
    removeItem () {
      this.$store.dispatch('REMOVE_CHECKLIST_ITEM', {
        categoryIndex: this.categoryIndex,
        itemIndex: this.itemIndex
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

  .subtract-progress,
  .add-progress {
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.1s;
  }

  &:hover {
    .subtract-progress,
    .add-progress {
      opacity: 1;
    }
  }

  .edit-item-count {
    flex: 0;
    width: 70px;
  }
}
</style>
