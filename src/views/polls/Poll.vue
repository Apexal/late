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
        request = await this.$http.post('/polls', { id: this.options.UID, value: obj.value })
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
    font-size: 1.6em;
    padding-top: 3%;
    text-align: center;
  }

  .vue-poll .ans-cnt {
    margin-top: 2%;
    margin-bottom: 2%;
  }

  .vue-poll .ans-cnt .ans-no-vote {
    margin-left: 5%;
    margin-right: 5%;

    border: 2px solid transparent;
    border-image: linear-gradient(to right, #3273DC 0%, #85b2fc 100%);
    border-image-slice: 1;

    .txt {
      color: #2E3B59;
      font-size: 1.2em;
    }

    &:hover {
      transform: scale(1.1);
    }
  }
</style>
