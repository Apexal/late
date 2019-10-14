<template>
  <div>
    <VuePoll
      v-bind="options"
      @addvote="addVote"
    />
  </div>
</template>

<script>

import VuePoll from 'vue-poll'

export default {
  components: {
    VuePoll
  },
  props: {
    options: {
      type: Object,
      default: function () {
        return {
          question: '',
          answers: [],
          endDate: new Date(),
          showResults: false
        }
      }
    }
  },
  methods: {
    addVote (obj) {
      console.log('You voted ' + obj.value + '!')
    }
  }
}
</script>

<style lang="scss">
  .vue-poll {
    font-family: Avenir,Helvetica,Arial,sans-serif;
    color: #2c3e50;
  }

  .qst {
    font-size: 1.3em;
    padding-top: 1em;
  }
</style>
