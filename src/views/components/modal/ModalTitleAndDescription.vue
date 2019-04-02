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
        @change="$emit('update-title', $event.target.value)"
        @keyup.enter="$emit('next-step')"
      >
    </div>
    <div class="field">
      <div class="control">
        <textarea
          id="add-description"
          :value="description"
          style="height: 25%;"
          cols="30"
          rows="10"
          class="input"
          :placeholder="descriptionPlaceholder"
          @change="$emit('update-description', $event.target.value)"
          @keyup.ctrl.enter="$emit('next-step')"
        />
      </div>
    </div>
  </div>
</template>

<script>
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
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
