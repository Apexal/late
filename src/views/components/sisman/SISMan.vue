<template>
  <div
    :title="messages[message]"
    class="sis-man is-unselectable hiding"
    :class="[ showing ? 'showing' : '', position ]"
    :style="{ left: left + '%' }"
  >
    <!-- <div class="speech-bubble">
      <h1>Hey there</h1>
      <div class="options is-flex">
        <span
          v-for="option in options"
          :key="option.text"
          class="option"
          @click="option.onclick"
        >{{ option.text }}</span>
      </div>
    </div>-->
    <img
      src="http://eng.rpi.edu/sites/default/files/SISMan_0.png"
      @mouseleave="moveSISMan"
      @click="showing = false"
    >
  </div>
</template>

<script>
export default {
  name: 'SISMan',
  data () {
    return {
      moving: false,
      line: 0,
      showing: false,
      hiding: true,
      left: 85,
      position: 'below',
      message: 0,
      messages: [
        'Nice presentation you got here...',
        'You\'re speaking too fast',
        'What a pretty audience',
        'Why did you make me?',
        'Are we here just to suffer?',
        'How do I escape this prison'
      ]
    };
  },
  mounted () {
    setTimeout(() => {
      this.showing = true;
    }, 5000);
  },
  methods: {
    moveSISMan () {
      if (this.moving) return;

      this.showing = false;
      this.moving = true;
      this.position = Math.random() < 0.5 ? 'above' : 'below';
      setTimeout(() => {
        this.left = Math.floor(Math.random() * (85 - 10)) + 20;
        this.showing = true;
        this.moving = false;
        this.message += 1;
        if (this.message === this.messages.length) this.message = 0;
      }, 1000 * (Math.round(Math.random() * 10) + 3));
    }
  }
};
</script>

<style lang="scss" scoped>
.speech-bubble {
  display: none;
  position: relative;
  padding: 15px;
  background: #2b2b2b;
  border-radius: 0.4em;
  font-family: "Comic Sans MS";
  font-size: 01em;
  color: white;
  opacity: 0.8;
  margin-bottom: 10px;

  .options .option {
    text-align: center;
    flex-grow: 1;
    color: lightskyblue;
    cursor: pointer;

    &:hover {
      color: blue;
    }
  }
}

.speech-bubble:after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 0;
  height: 0;
  border: 36px solid transparent;
  border-top-color: #2b2b2b;
  border-bottom: 0;
  border-left: 0;
  margin-left: -18px;
  margin-bottom: -36px;
}

.sis-man {
  cursor: pointer;
  position: fixed;
  width: 150px;

  z-index: 100;
  transition: top 0.5s, bottom 0.5s;

  &.above {
    transform: rotate(180deg);
    top: -115px;

    &:not(.showing) {
      top: -250px !important;
    }

    &:hover {
      top: -90px;
    }
  }

  &.below {
    transform: rotate(0deg);
    bottom: -115px;

    &:not(.showing) {
      bottom: -250px !important;
    }

    &:hover {
      bottom: -90px;
    }
  }
}
</style>
