<template>
  <div>
    <div class="field">
      <input
        id="add-assignment-title"
        v-model="localTitle"
        type="text"
        class="input is-medium"
        maxlength="75"
        placeholder="What do you have to do?"
        required
      >
    </div>
    <div class="field">
      <div class="control">
        <textarea
          id="add-assignment-description"
          v-model="localDescription"
          style="height: 25%;"
          cols="30"
          rows="10"
          class="input"
          placeholder="(optional) Long description of the assignment here! You can use Markdown!"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AssessmentAddTitleAndDescription",
  props: ["title", "description"],
  data() {
    return {
      localTitle: this.title,
      localDescription: this.description
    };
  },
  watch: {
    localTitle: function(val) {
      this.$emit("update-title", val);
    },
    localDescription: function(val) {
      this.$emit("update-desc", val);
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
