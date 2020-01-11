<!--Tools: Timer page-->
<template>
  <section class="section">
    <h1 class="title has-text-centered-mobile">
      Study Timer
    </h1>
    <h2 class="subtitle has-text-centered-mobile">
      Breaks down your work into 25 minute focus times and 5 minute breaks
      using the
      <a
        href="https://en.wikipedia.org/wiki/Pomodoro_Technique"
      >Pomodoro Technique</a>
    </h2>
    <div
      class="columns"
    >
      <div class="description column is-one-half">
        <h2>
          Studies have shown that this method helps with staying productive for
          long periods of time without getting burnt out.
        </h2>
        <br>
        <h2>
          Below the timer is a scratchpad to scribble out your thoughts and work.
          Your text is automatically saved, so feel free to leave and come back to
          this page as needed.
        </h2>
        <br>
        <ul class="instructions">
          <li class="subtitle">
            How to use the Pomodoro Technique:
          </li>
          <li>
            <i class="fas fa-tasks" />Decide on one task to complete.
          </li>
          <li>
            <i class="fas fa-clock" />Start the work timer.
          </li>
          <li>
            <i class="fas fa-cogs" />Work on that task until the timer rings.
          </li>
          <li>
            <i class="fas fa-mug-hot" />Switch to the next break timer and relax.
          </li>
          <li>
            <i class="fas fa-circle-notch" />After about three of these cycles,
            take a longer 15 minute break.
          </li>
        </ul>
      </div>

      <div class="column">
        <div class="study-tools-timer has-background-dark has-text-white has-text-centered">
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

          <div class="padding">
            <span class="stage-title">{{ currentStage.title }}</span>
            <span class="minutes">{{ minutes }}</span>
            <span class="separator">:</span>
            <span class="seconds">{{ seconds }}</span>
          </div>
          <div class="buttons has-addons is-flex is-fullwidth">
            <button
              class="button"
              title="Skip to prev stage"
              @click="$store.commit('STUDY_TOOLS_TIMER_PREV_STAGE')"
            >
              <i class="fas fa-step-backward" />
            </button>
            <button
              class="button is-success"
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
              class="button is-danger"
              @click="$store.commit('RESET_STUDY_TOOLS_TIMER')"
            >
              <i class="fas fa-history" />
            </button>
            <button
              class="button"
              title="Skip to next stage"
              @click="$store.commit('STUDY_TOOLS_TIMER_NEXT_STAGE')"
            >
              <i class="fas fa-step-forward" />
            </button>
          </div>
        </div>
        <br>
        <textarea
          v-model="scratchHTML"
          class="input study-tools-scratchpad"
          placeholder="Anything typed here will be remembered."
        />
      </div>
    </div>
    <hr>
    <div class="buttons">
      <router-link
        class="button is-link"
        :to="{name: 'tools'}"
      >
        <i class="fas fa-angle-left" />
        All Tools
      </router-link>
    </div>
  </section>
</template>

<script>
export default {
  name: 'StudyToolsPage',
  data () {
    return {
      scratchHTML: ''
    }
  },
  computed: {
    paused () {
      return this.$store.state.studytoolstimer.paused
    },
    stages () {
      return this.$store.state.studytoolstimer.stages
    },
    stageIndex () {
      return this.$store.state.studytoolstimer.stageIndex
    },
    currentStage () {
      return this.$store.getters.studyToolsTimerCurrentStage
    },
    minutes () {
      return this.$store.getters.studyToolsTimerMinutes
    },
    seconds () {
      return this.$store.getters.studyToolsTimerSeconds
    }
  },
  watch: {
    scratchHTML (newHTML) {
      localStorage.setItem('scratchHTML', newHTML)
    },
    seconds (val) {
      document.title = this.$store.getters.studyToolsTimerMinutes + ':' + this.$store.getters.studyToolsTimerSeconds
    }
  },
  mounted () {
    this.scratchHTML = localStorage.getItem('scratchHTML') || ''
  }
}
</script>

<style lang="scss" scoped>

.study-tools-timer {
  display: block;
  z-index: 30;
  border-radius: 10px;
  padding: 0;
  width: 100%;
  min-width: 300px;
  max-width: 600px;
  max-height: 200px;
  margin: 0 auto;
  font-size: 3rem;
  .padding {
    padding: 0 20px;
  }

  button {
    flex: 1;
    margin: 0;
    border-radius: 0px !important;
  }

  button:nth-child(1),
  button:last-child {
    border-radius: 0px 0px 5px 5px;
  }

  progress {
    margin-bottom: 5px;
    border-radius: 5px 5px 0px 0px;
  }
  .dismiss-timer {
    position: absolute;
    top: 20px;
    right: 5px;
  }

  .stage-title {
    width: 100%;
    display: block;
    border-bottom: 1px solid rgba(219, 219, 219, 0.7);
  }
  @media only screen and (max-width: 1000px) {
    font-size: 2rem;
  }
}

.study-tools-scratchpad {
  width: 100%;
  min-width: 300px;
  max-width: 600px;
  display: block;
  margin: 0 auto;
}

.button i.fas,.instructions li .fas {
  margin-right: 5px;
}
</style>
