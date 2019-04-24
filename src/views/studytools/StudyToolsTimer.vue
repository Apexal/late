<template>
  <div class="study-tools-timer">
    <h2 class="subtitle">
      Study/Work Timer
    </h2>

    <div
      class="timer has-background-dark has-text-white has-text-centered"
      :class="{ detached }"
    >
      <h3 class="has-text-grey">
        {{ currentStage.title }} ({{ stageIndex + 1 }}/{{ stages.length }})
      </h3>
      <span class="minutes">{{ minutes }}</span>
      <span class="separator">:</span>
      <span class="seconds">{{ seconds }}</span>

      <div class="buttons has-addons is-flex is-fullwidth">
        <button
          class="button"
          @click="prevStage"
        >
          <i class="fas fa-chevron-left" />
        </button>
        <button
          class="button is-success"
          @click="toggleTimer"
        >
          {{ paused ? 'Start' : 'Pause' }}
        </button>
        <button
          class="button is-danger"
          @click="resetTimer"
        >
          Reset
        </button>
        <button
          class="button"
          @click="nextStage"
        >
          <i class="fas fa-chevron-right" />
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StudyToolsTimer',
  data () {
    return {
      detached: false,
      initialTime: 25 * 60,
      timer: null,
      totalTime: 5,
      paused: true,
      stageIndex: 0,
      stages: [
        {
          title: 'Study/Work',
          duration: 25 * 60
        },
        {
          title: 'Short Break',
          duration: 5 * 60
        },
        {
          title: 'Study/Work',
          duration: 25 * 60
        },
        {
          title: 'Short Break',
          duration: 5 * 60
        },
        {
          title: 'Study/Work',
          duration: 25 * 60
        },
        {
          title: 'Short Break',
          duration: 5 * 60
        },
        {
          title: 'Study/Work',
          duration: 25 * 60
        },
        {
          title: 'Long Break',
          duration: 15 * 60
        }
      ]
    };
  },
  computed: {
    currentStage () {
      return this.stages[this.stageIndex];
    },
    minutes () {
      return this.padTime(Math.floor(this.totalTime / 60));
    },
    seconds () {
      return this.padTime(this.totalTime % 60);
    }
  },
  methods: {
    toggleTimer () {
      this.paused = !this.paused;

      if (this.paused) {
        clearInterval(this.timer);
        this.timer = null;
      } else {
        this.timer = setInterval(() => this.countdown(), 1000);
      }
    },
    resetTimer: function () {
      this.totalTime = this.initialTime;
      clearInterval(this.timer);
      this.timer = null;
      this.paused = true;
    },
    padTime: function (time) {
      return (time < 10 ? '0' : '') + time;
    },
    countdown: function () {
      if (this.totalTime === 0) { this.nextStage(); } else { this.totalTime--; }
    },
    prevStage () {
      this.stageIndex -= 1;
      if (this.stageIndex === -1) this.stageIndex = this.stages.length - 1;
      this.totalTime = this.stages[this.stageIndex].duration;
    },
    nextStage () {
      this.stageIndex += 1;
      if (this.stageIndex === this.stages.length) this.stageIndex = 0;
      this.totalTime = this.stages[this.stageIndex].duration;
    }
  }
};
</script>

<style lang="scss" scoped>
.timer {
  border-radius: 20px;
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
