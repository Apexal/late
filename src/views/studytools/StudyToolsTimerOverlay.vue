<!--Tools: Timer overlay module-->
<template>
  <div
    v-if="open"
    class="study-tools-timer-overlay has-background-dark has-text-white has-text-centered"
  >
    <audio
      ref="audio"
      src="/audio/alarm.mp3"
    />
    <progress
      class="progress is-success"
      max="7"
      :value="stageIndex"
      :title="`Stage ${stageIndex + 1} out of 8`"
    >
      {{ stageIndex / 7 }}%
    </progress>

    <span
      title="Dismiss the timer"
      class="delete dismiss-timer"
      @click="$store.dispatch('SET_STUDY_TOOLS_TIMER_OPEN', false)"
    />
    <div class="padding">
      <span class="stage-title">{{ currentStage.title }}</span>
      <span class="minutes">{{ minutes }}</span>
      <span class="separator">:</span>
      <span class="seconds">{{ seconds }}</span>
    </div>
    <div class="buttons has-addons is-flex is-fullwidth">
      <button
        class="button is-small"
        title="Skip to prev stage"
        @click="$store.commit('STUDY_TOOLS_TIMER_PREV_STAGE')"
      >
        <i class="fas fa-step-backward" />
      </button>
      <button
        class="button is-success is-small"
        title="Play/pause timer"
        @click="$store.dispatch('TOGGLE_STUDY_TOOLS_TIMER')"
      >
        <i
          class="fas"
          :class="[paused ? 'fa-play' : 'fa-pause']"
        />
      </button>
      <button
        title="Reset current stage"
        class="button is-danger is-small"
        @click="$store.commit('RESET_STUDY_TOOLS_TIMER')"
      >
        <i class="fas fa-history" />
      </button>
      <button
        class="button is-small"
        title="Skip to next stage"
        @click="$store.commit('STUDY_TOOLS_TIMER_NEXT_STAGE')"
      >
        <i class="fas fa-step-forward" />
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StudyToolsTimerOverlay',
  props: {
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
.study-tools-timer-overlay {
  position: fixed;
  left: 15px;
  bottom: 15px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24);
  z-index: 30;
  border-radius: 10px 0px 0px 0px;
  padding: 0;
  width: 10%;
  min-width: 300px;
  max-width: 600px;
  margin: 0 auto;
  font-size: 2rem;
  .padding {
    padding: 0 35px 0px 15px;
  }

  button {
    flex: 1;
    margin: 0;
    border-radius: 0px;
  }

  progress {
    margin-bottom: 5px;
    height: 5px;
    border-radius: 10px 0px 0px 0px;
  }
  .dismiss-timer {
    position: absolute;
    height: 100%;
    top: 0px;
    bottom: 8px;
    right: 10px;
    margin: auto;
  }

  div span:not(.stage-title) {
    font-weight: 100;
  }

  @media only screen and (max-width: 768px) {
    position: initial;
    width: 100%;
  }
}
</style>
