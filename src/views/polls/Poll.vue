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
  data () {
    return {
      options: {
        question: 'How are you?',
        answers: [
          { value: 1, text: 'Good', votes: 0 },
          { value: 2, text: 'Bad', votes: 0 },
          { value: 3, text: 'Not good', votes: 0 },
          { value: 4, text: 'Super bad', votes: 0 }
        ]
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
    padding-top: 1em;
  }
</style>
