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
        question: '',
        answers: []
      },
      currentID: 0
    }
  },
  methods: {
    addVote (obj) {
      console.log('You voted ' + obj.value + '!')
    },
    changeTitle (title) {
      this.options.question = title
    },
    addAnswer (answer) {
      this.options.answers.push({ value: this.currentID, text: answer, votes: 0 })
      this.currentID++
    },
    removeAnswer (answer) {
      this.options.answers =
         this.options.answers.filter(e => e.text !== answer)
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
