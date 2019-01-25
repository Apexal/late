<template>
  <div>
    <div class="field">
      <input
        id="add-title"
        v-model="localTitle"
        type="text"
        class="input"
        maxlength="75"
        :placeholder="titlePlaceHolder"
      >
    </div>
    <div class="field">
      <div class="control">
        <textarea
          id="add-description"
          v-model="localDescription"
          style="height: 25%;"
          cols="30"
          rows="10"
          class="input"
          :placeholder="descriptionPlaceHolder"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModalTitleAndDescription',
  props: ['title', 'description', 'titlePlaceHolder', 'descriptionPlaceHolder'],
  data () {
    return {
      localTitle: this.title,
      localDescription: this.description
    };
  },
  watch: {
    localTitle: function (val) {
      this.$emit('update-title', val);
    },
    localDescription: function (val) {
      this.$emit('update-desc', val);
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
