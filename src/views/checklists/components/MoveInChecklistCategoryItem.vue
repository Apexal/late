<!--Tools: Move-in page checklist category item module-->
<template>
  <div
    class="panel-block is-flex item"
    :class="[{ editing, viewing }, itemClass]"
    :title="editing ? 'Drag me to reorder items!' : ''"
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
    <template v-else-if="!viewing">
      <b class="is-unselectable item-count">{{ item.count }}</b>
      <b-checkbox
        v-model="complete"
        title="Click to toggle!"
      />
    </template>
    <template v-else>
      <span class="is-unselectable">{{ item.count }}</span>
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
    },
    viewing: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    complete: {
      get () {
        return this.item.complete;
      },
      set (newComplete) {
        this.$store.dispatch('UPDATE_CHECKLIST_ITEM', {
          categoryIndex: this.categoryIndex,
          itemIndex: this.itemIndex,
          updates: { complete: newComplete }
        });
      }
    },
    itemClass () {
      return this.item.complete ? 'completed' : '';
    }
  },
  methods: {
    updateItemCount (count) {
      if (count < 0 || count > 100) return;

      const updates = { count };

      this.$store.commit('UPDATE_CHECKLIST_ITEM', {
        categoryIndex: this.categoryIndex,
        itemIndex: this.itemIndex,
        updates
      });
    },
    removeItem () {
      this.$store.commit('REMOVE_CHECKLIST_ITEM', {
        categoryIndex: this.categoryIndex,
        itemIndex: this.itemIndex
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.item {
  &.editing {
    cursor: move;
  }

  .item-title {
    flex: 1;
  }

  .item-count {
    margin-right:5px;
  }

  input {
    margin: 0;
  }

  &:not(.viewing):not(.editing) {
    border-left: 2px solid rgb(255, 175, 175);
    &.completed {
      border-left: 2px solid lightgreen;
    }
  }

  .edit-item-count {
    flex: 0;
    width: 70px;
  }
}
</style>
