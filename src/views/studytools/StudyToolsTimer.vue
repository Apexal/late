<template>
  <div
    v-if="open"
    class="study-tools-timer has-background-dark has-text-white has-text-centered"
    :class="{ detached }"
  >
    <span
      class="delete"
      @click="$store.dispatch('SET_STUDY_TOOLS_TIMER_OPEN', false)"
    />
    <h3>
      {{ currentStage.title }} ({{ stageIndex + 1 }}/{{ stages.length }})
    </h3>
    <span class="minutes">{{ minutes }}</span>
    <span class="separator">:</span>
    <span class="seconds">{{ seconds }}</span>

    <div class="buttons has-addons is-flex is-fullwidth">
      <button
        class="button"
        @click="$store.commit('STUDY_TOOLS_TIMER_PREV_STAGE')"
      >
        <i class="fas fa-chevron-left" />
      </button>
      <button
        class="button is-success"
        @click="$store.dispatch('TOGGLE_STUDY_TOOLS_TIMER')"
      >
        <i
          class="fas"
          :class="[ paused ? 'fa-play' : 'fa-pause' ]"
        />
      </button>
      <button
        class="button is-danger"
        @click="$store.commit('RESET_STUDY_TOOLS_TIMER')"
      >
        <i class="fas fa-history" />
      </button>
      <button
        class="button"
        @click="$store.commit('STUDY_TOOLS_TIMER_NEXT_STAGE')"
      >
        <i class="fas fa-chevron-right" />
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StudyToolsTimer',
  props: {
    detached: {
      type: Boolean,
      default: false
    },
    open: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    paused () {
      return this.$store.state.studytoolstimer.paused;
    },
    stages () {
      return this.$store.state.studytoolstimer.stages;
    },
    stageIndex () {
      return this.$store.state.studytoolstimer.stageIndex;
    },
    currentStage () {
      return this.$store.getters.studyToolsTimerCurrentStage;
    },
    minutes () {
      return this.$store.getters.studyToolsTimerMinutes;
    },
    seconds () {
      return this.$store.getters.studyToolsTimerSeconds;
    }
  }
};
</script>

<style lang="scss" scoped>
.study-tools-timer {
  z-index: 30;
  border-radius: 10px;
  padding-top: 30px;
  width: 50%;
  margin: 0 auto;
  font-size: 5em;

  &.detached {
    position: fixed;
    padding-top: 10px;
    bottom: 10px;
    right: 10px;
    font-size: 2em;
    width: 20%;
  }

  button {
    flex: 1;
  }
}
</style>
