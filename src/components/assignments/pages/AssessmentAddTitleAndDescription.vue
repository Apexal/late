<template>
  <div>
    <div class="field">
      <label
        for="add-assignment-title"
      >
        What do you have to do?
      </label>
      <input
        id="add-assignment-title"
        v-model="local_title"
        type="text"
        class="input"
        maxlength="200"
        placeholder="Short descriptive title"
        required
      >
    </div>
    <div class="field">
      <label
        for="add-assignment-description"
      >
        Description
      </label>
      <div class="control">
        <textarea
          style="height: 25%;"
          id="add-assignment-description"
          v-model="local_description"
          cols="30"
          rows="10"
          class="input"
          placeholder="Long description of the assignment here! You can use Markdown!"
        />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AssessmentAddTitleAndDescription',
  data () {
    return {
      local_title: this.title,
      local_description: this.description
    }
  },
  props: ['title', 'description'],
  watch: {
    local_title: function(val) {
      this.$emit('update-title', val);
    },
    local_description: function(val) {
      this.$emit('update-desc', val);
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
