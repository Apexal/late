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
        question: 'What\'s your favourite <strong>JS</strong> framework?',
        answers: [
          { value: 1, text: 'Vue', votes: 53 },
          { value: 2, text: 'React', votes: 35 },
          { value: 3, text: 'Angular', votes: 30 },
          { value: 4, text: 'Other', votes: 10 }
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
