<template>
  <div
    v-if="showing"
    class="sis-man"
  >
    <div class="speech-bubble">
      <h1>{{ message }}</h1>
      <div class="options is-flex">
        <span
          v-for="option in options"
          :key="option.text"
          class="option"
          @click="option.onclick"
        >{{ option.text }}</span>
      </div>
    </div>
    <img src="http://eng.rpi.edu/sites/default/files/SISMan_0.png">
  </div>
</template>

<script>
export default {
  name: 'SISMan',
  data () {
    return {
      showing: false,
      message: 'Don\'t forget me.',
      options: [
        {
          text: 'ok...',
          onclick () {
            alert('Thank you for your service.');
          }
        },
        {
          text: 'back',
          onclick () {
            alert('you fool.');
          }
        }
      ]
    };
  }
};
</script>

<style lang="scss" scoped>
.speech-bubble {
  position: relative;
  padding: 30px;
  background: #2b2b2b;
  border-radius: .4em;
  font-family: 'Comic Sans MS';
  font-size: 1.4em;
  color: white;
  opacity: 0.8;

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
  content: '';
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
  cursor: wait;
  position: fixed;
  width: 200px;
  right: 10px;
  bottom: 10px;
  z-index: 100;
}
</style>
