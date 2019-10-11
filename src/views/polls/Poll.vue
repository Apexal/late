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
    pq: {
      type: String,
      default: ''
    },
    // eslint-disable-next-line vue/require-default-prop
    pa: {
      type: Array
    }
  },
  data () {
    return {
      options: {
        question: this.pq,
        answers: this.pa
      }
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
      this.options.answers.push(answer)
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
    font-size: 1.3em;
    padding-top: 1em;
  }
</style>
