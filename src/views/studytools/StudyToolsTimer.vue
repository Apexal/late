<template>
  <div
    v-if="open"
    class="study-tools-timer has-background-dark has-text-white has-text-centered"
    :class="{ detached }"
  >
    <audio
      ref="audio"
      src="/foghorn.wav"
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
      v-if="detached"
      title="Dismiss the timer"
      class="delete dismiss-timer"
      @click="$store.dispatch('SET_STUDY_TOOLS_TIMER_OPEN', false)"
    />
    <div class="padding">
      <span class="stage-title">
        {{ currentStage.title }}
      </span>
      <span class="minutes">{{ minutes }}</span>
      <span class="separator">:</span>
      <span class="seconds">{{ seconds }}</span>
    </div>
    <div class="buttons has-addons is-flex is-fullwidth">
      <button
        class="button"
        title="Skip to prev stage"
        :class="{ 'is-small': detached }"
        @click="$store.commit('STUDY_TOOLS_TIMER_PREV_STAGE')"
      >
        <i class="fas fa-step-backward" />
      </button>
      <button
        class="button is-success"
        title="Play/pause timer"
        :class="{ 'is-small': detached }"
        @click="$store.dispatch('TOGGLE_STUDY_TOOLS_TIMER')"
      >
        <i
          class="fas"
          :class="[ paused ? 'fa-play' : 'fa-pause' ]"
        />
      </button>
      <button
        title="Reset current stage"
        class="button is-danger"
        :class="{ 'is-small': detached }"
        @click="$store.commit('RESET_STUDY_TOOLS_TIMER')"
      >
        <i class="fas fa-history" />
      </button>
      <button
        class="button"
        title="Skip to next stage"
        :class="{ 'is-small': detached }"
        @click="$store.commit('STUDY_TOOLS_TIMER_NEXT_STAGE')"
      >
        <i class="fas fa-step-forward" />
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
  padding: 0;
  width: 50%;
  min-width: 300px;
  max-width: 600px;
  margin: 0 auto;
  font-size: 5rem;
  .padding {
    padding: 0 20px;
  }
  &.detached {
    position: fixed;
    bottom: 10px;

    right: 10px;
    @media screen and (max-width: 1280px) {
      right: unset;
      left: 10px;
    }
    font-size: 2rem;
    width: fit-content;
  }

  button {
    flex: 1;
    margin: 0;
  }

  progress {
    margin-bottom: 5px;
  }
  .dismiss-timer {
    position: absolute;
    top:20px;
    right: 5px;
  }
}
</style>
