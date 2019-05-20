<template>
  <div class="panel-block item">
    {{ item.title }}
  </div>
</template>

<script>
export default {
  name: 'MoveInChecklistCategoryItem',
  props: {
    item: {
      type: String,
      required: true
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
