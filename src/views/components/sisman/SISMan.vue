<template>
  <div
    title="Hey there..."
    class="sis-man is-unselectable"
    :class="{ showing, hiding }"
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
      @click="showing = !showing"
    >
  </div>
</template>

<script>
import { setInterval, setTimeout } from 'timers';
export default {
  name: 'SISMan',
  data () {
    return {
      line: 0,
      showing: true,
      hiding: true,
      left: 85,
      options: [
        // {
        //   text: 'yes...',
        //   onclick () {
        //     alert('Thank you for your honesty.');
        //   }
        // },
        // {
        //   text: 'no',
        //   onclick () {
        //     alert('wrong.');
        //   }
        // }
      ]
    };
  },
  mounted () {
    // setInterval(() => {
    //   this.showing = false;
    //   setTimeout(() => {
    //     this.left = Math.floor(Math.random() * (85 - 10)) + 20;
    //     this.showing = true;
    //   }, 1000);
    // }, 5000);
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
  transition: bottom 0.5s;
  bottom: 0px;

  &:not(.showing) {
    bottom: -250px !important;
  }

  &.hiding {
    bottom: -110px;

    &:hover {
      bottom: -90px;
    }
  }
}
</style>
