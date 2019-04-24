<template>
  <div class="study-tools-scratchpad">
    <h2 class="subtitle">
      Scratchpad
    </h2>

    <wysiwyg v-model="scratchHTML" />
  </div>
</template>

<script>
export default {
  name: 'StudyToolsScratchpad',
  data () {
    return {
      scratchHTML: ''
    };
  },
  watch: {
    scratchHTML (newHTML) {
      localStorage.setItem('scratchHTML', newHTML);
    }
  },
  mounted () {
    this.scratchHTML = localStorage.getItem('scratchHTML') || '';
  }
};
</script>

<style lang="scss" scoped>
@import "~vue-wysiwyg/dist/vueWysiwyg.css";
</style>
