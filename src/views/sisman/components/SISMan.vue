<!--SISMan-->
<template>
  <div
    :title="message"
    class="sis-man is-unselectable"
    :class="SISManCSS.classes"
    :style="SISManCSS.style"
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
      @click="click"
    >
  </div>
</template>

<script>
export default {
  name: 'SISMan',
  data () {
    return {};
  },
  computed: {
    message () {
      return this.$store.state.SISMan.message;
    },
    SISManCSS () {
      return this.$store.getters.SISManCSS;
    }
  },
  mounted () {},
  methods: {
    click () {
      this.$store.dispatch('DISMISS_SISMAN');
      const tour = this.$store.getters.getTourFromRoute(this.$route);
      if (!tour) return;

      const index = this.$store.state.tours.tours.indexOf(tour);

      if (index) {
        this.$store.commit('SET_TOUR_INDEX', index);
      }
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
  transition: top 0.5s, bottom 0.5s, left 0.5s, right 0.5s;

  &:not(.showing) {
    display: none !important;
  }

  &.top {
    transform: rotate(180deg);
    top: -115px;

    &:not(.peeking) {
      top: -250px !important;
    }

    &:hover {
      top: -90px;
    }
  }

  &.bottom {
    transform: rotate(0deg);
    bottom: -115px;

    &:not(.peeking) {
      bottom: -250px !important;
    }

    &:hover {
      bottom: -90px;
    }
  }

  &.left {
    transform: rotate(90deg);
    left: -115px;

    &:not(.peeking) {
      left: -250px !important;
    }

    &:hover {
      left: -90px;
    }
  }

  &.right {
    transform: rotate(-90deg);
    right: -115px;

    &:not(.peeking) {
      right: -250px !important;
    }

    &:hover {
      right: -90px;
    }
  }
}
</style>
