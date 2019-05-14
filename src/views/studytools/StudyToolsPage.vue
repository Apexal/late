<template>
  <div
    v-if="open"
    class="columns is-multiline tool-wrapper"
  >
    <h1 class="title column is-full">
      Study Tools
    </h1>
    <section class="description column is-one-half">
      <h2>
        This timer helps you break down your work into 25 minute focus times and 5 minute breaks using the <a href="https://en.wikipedia.org/wiki/Pomodoro_Technique">Pomodoro Technique.</a> Studies have shown that this method helps with staying productive for long periods of time without getting burnt out.
      </h2>
      <br>
      <h2>Below the timer is a scratchpad to scribble out thoughts and works. Your text is automatically saved, so feel free to leave and come back to this page as needed.</h2>
      <br>
      <ul class="instructions">
        <li class="subtitle">
          How to use the Pomodoro Technique:
        </li>
        <li><i class="fas fa-tasks" />Decide on one task to complete.</li>
        <li><i class="fas fa-clock" />Start the work timer.</li>
        <li><i class="fas fa-cogs" />Work on that task until the timer rings.</li>
        <li><i class="fas fa-mug-hot" />Switch to the next break timer and relax.</li>
        <li><i class="fas fa-circle-notch" />After about three of these cycles, take a longer 15 minute break.</li>
      </ul>
    </section>

    <div class="column tools-container">
      <div
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
      <br>
      <div class="study-tools-scratchpad">
        <wysiwyg v-model="scratchHTML" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StudyToolsPage',
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
  data () {
    return {
      scratchHTML: ''
    };
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

.tool-wrapper {
  padding: 40px 0px 0px 24px;
  margin: 0 auto;
}


.title {
  padding-bottom: 0px;
  padding-left: 0px;
  border-bottom-color: #dbdbdb;
  border-bottom-style: solid;
  border-bottom-width: 1px;
}

.description {
  padding: 0 0 0 15px;
  margin-right: 50px;
  .instructions {
    font-size: 1.2em;
    .subtitle {
      margin-bottom: 5px;
      font-weight: bold;
    }
    li i {
      width: 25px;
      margin-right: 10px;
    }
  }
}

.tools-container {
  padding-top: 0;
  padding-right: 15px;
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
      border-radius: 0px!important;
    }

    button:nth-child(1),button:last-child {
      border-radius: 0px 0px 5px 5px;
    }

    progress {
      margin-bottom: 5px;
      border-radius: 5px 5px 0px 0px;
    }
    .dismiss-timer {
      position: absolute;
      top:20px;
      right: 5px;
    }

    .stage-title {
      width: 100%;
      display: block;
      border-bottom: 1px solid rgba(219, 219, 219, 0.7);
    }
  }

  .study-tools-scratchpad {
    width: 100%;
    min-width: 300px;
    max-width: 600px;
    display: block;
    margin: 0 auto;
  }
}
</style>
