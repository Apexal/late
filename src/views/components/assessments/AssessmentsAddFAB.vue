<template>
  <div id="assessments-add-fab">
    <p
      class="option has-text-dark"
      title="Add assignment"
      @click="$store.commit('TOGGLE_ADD_ASSIGNMENT_MODAL')"
    >
      <i class="fas fa-clipboard-check" />
    </p>
    <p
      class="option has-text-dark"
      title="Add exam"
      @click="$store.commit('TOGGLE_ADD_EXAM_MODAL')"
    >
      <i class="fas fa-exclamation-triangle" />
    </p>
    <div class="circle">
      +
    </div>
  </div>
</template>

<script>
export default {
  name: 'AssessmentsAddFAB'
};
</script>

<style scoped lang="scss">
#assessments-add-fab {
  display: flex;
  position: fixed;
  justify-content: center;
  flex-direction: column;
  align-items: center;
  right: 10px;
  bottom: 10px;
  color: white;
  z-index: 10;
  text-align: center;
  .option {
    opacity: 0;
    height: 0;
    overflow: hidden;
    transition: opacity 0.2s;
    color: #222;
    font-size: 2em;
    width: 50px;

    border-radius: 100%;

    cursor: pointer;
  }
  .circle {
    width: 60px;
    height: 60px;
    border-radius: 100%;
    font-size: 3em;

    cursor: pointer;
    transition: background-color 0.2s;
    background-color: #222;

    line-height: 50px;
    text-align: center;
    vertical-align: middle;

    &:hover {
      box-shadow: 1px 1px 4px #444;
      background-color: #333;
    }
  }

  &:hover {
    .option {
      height: 50px;
      opacity: 1;
    }
  }
}
</style>
