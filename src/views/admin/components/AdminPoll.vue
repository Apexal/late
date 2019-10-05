<template>
  <div class="admin-poll">
    <h2 class="subtitle">
      Admin Poll
    </h2>
    <div class="columns">
      <div class="column is-half">
        <div class="panel">
          <p class="panel-heading">
            Create a Poll
          </p>
          <div class="panel-block">
            <p class="control">
              <input
                v-model="Question"
                placeholder="Question"
                class="input"
                type="text"
              >
              <input
                v-model="Answers[AnswerCount]"
                placeholder="Answer"
                class="input"
                type="text"
              >
              <button
                class="button"
                @click="addAnswer"
              >
                Add Answer
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminFun',
  data () {
    return {
      Question: '',
      AnswerCount: 0,
      Answers: []
    }
  },
  methods: {
    addAnswer () {
      let a = this.Answers[this.AnswerCount]
      if (a.length > 0) {
        console.log(a, this.AnswerCount)
        this.AnswerCount++
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
