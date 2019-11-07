<template>
  <div>
    <VuePoll
      v-bind.sync="options"
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
          showResults: Boolean,
          UID: Number
        }
      }
    }
  },
  methods: {
    async addVote (obj) {
      // send voted data to database
      let request
      // options.UID: the UID of the poll in the database
      // obj.value: the id of the user's answer
      try {
        request = await this.$http.patch('/polls', { id: this.options.UID, value: obj.value })
      } catch (e) {
        console.error(e)
      }
      this.options.showResults = true

      // decrement unvoted count for poll tab
      try {
        this.$store.commit('POLL_VOTE')
      } catch (e) {
        console.error(e)
      }
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
    padding-top: 5%;
    text-align: center;
  }
  .vue-poll .ans-cnt {
    margin-top: 2%;
    margin-bottom: 4%;
  }
  .vue-poll .ans-cnt .ans-no-vote {
    border: 2px solid #2E3B59;
    border-radius: 4px;
    .txt {
      color: #2E3B59;
    }
  }
</style>
