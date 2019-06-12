<!--Modals: Set title and description-->
<template>
  <div>
    <div class="field">
      <input
        id="add-title"
        :value="title"
        type="text"
        class="input is-medium"
        maxlength="75"
        :placeholder="titlePlaceholder"
        list="new-assessment-title-old-titles"
        autocomplete="off"
        @change="$emit('update-title', $event.target.value)"
        @keyup.enter="$emit('next-step')"
      >
      <datalist id="new-assessment-title-old-titles">
        <option
          v-for="(oldTitle, index) in oldTitles"
          :key="index"
          :value="oldTitle"
        />
      </datalist>
    </div>
    <div class="field">
      <div class="control">
        <textarea
          id="add-description"
          ref="description"
          :value="description"
          style="height: 25%;"
          cols="30"
          rows="10"
          class="input"
          :placeholder="descriptionPlaceholder"
          @keyup.ctrl.enter="$emit('next-step')"
        />
      </div>
    </div>
  </div>
</template>

<script>
import SimpleMDE from 'simplemde';

export default {
  name: 'ModalTitleAndDescription',
  props: {
    assessmentType: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    titlePlaceholder: {
      type: String,
      default: ''
    },
    descriptionPlaceholder: {
      type: String,
      default: ''
    },
    oldTitles: {
      type: Set,
      default: () => new Set()
    }
  },
  data () {
    return {
      simplemde: null
    };
  },
  watch: {},
  mounted () {
    this.simplemde = new SimpleMDE({
      element: this.$refs.description,
      initialValue: this.description
    });

    this.simplemde.codemirror.on('change', () => {
      this.$emit('update-description', this.simplemde.value());
    });
  }
};
</script>

<style lang="scss" scoped>
@import "~simplemde/dist/simplemde.min.css";
</style>
