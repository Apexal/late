<template>
  <div class="panel-block is-flex item">
    <span class="item-title">{{ item.title }}</span>
    <input
      v-if="item.count === 1"
      type="checkbox"
      :checked="item.progress"
      @change="updateItemProgress($event.target.checked ? 1 : 0)"
    >
    <template v-else>
      0
      <input
        :value="item.progress"
        type="range"
        min="0"
        :max="item.count"
        step="1"
        :list="'steplist-' + item.count"
        @change="updateItemProgress($event.target.value)"
      >
      {{ item.count }}
      <datalist :id="'steplist-' + item.count">
        <option
          v-for="i in item.count + 1"
          :key="i"
        >
          {{ i - 1 }}
        </option>
      </datalist>
    </template>
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
  methods: {
    updateItemProgress (progress) {
      alert(progress);

      this.$store.commit('UPDATE_CHECKLIST_ITEM', {
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
}
</style>
