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
              <b-input
                v-model="Question"
                style="margin-bottom: 10px"
                placeholder="Question"
                type="text"
                class=""
              />
              <b-field grouped>
                <b-input
                  v-model="CurrentAnswer"
                  placeholder="Answer"
                  type="text"
                  expanded
                  @keyup.enter.native="addAnswer"
                />
                <button
                  class="button"
                  @click="addAnswer"
                >
                  Add Answer
                </button>
              </b-field>
              <b-field class="answer_list">
                <ul>
                  <template
                    v-for="answer in Answers"
                  >
                    <li
                      :key="answer"
                      class="answer"
                      @click="removeAnswer(answer)"
                    >
                      • {{ answer }}
                    </li>
                  </template>
                </ul>
              </b-field>
              <button
                v-if="Question && Answers.length > 0"
                class="button"
                @click="createPoll"
              >
                Submit Poll
              </button>
              <b-datepicker
                placeholder="Type or select a date..."
                icon="calendar-today"
                editable
              />
            </p>
          </div>
        </div>
      </div>
      <div class="column is-half">
        <Poll ref="poll" />
      </div>
    </div>
  </div>
</template>

<script>
import Poll from '@/views/polls/Poll'
export default {
  name: 'AdminFun',
  components: {
    Poll
  },
  data () {
    return {
      Question: '',
      CurrentAnswer: '',
      Answers: []
    }
  },
  watch: {
    'Question': function (val, oldVal) {
      this.$refs.poll.changeTitle(val)
    }
  },
  methods: {
    addAnswer () {
      if (!this.CurrentAnswer) return // do nothing if input is empty
      this.Answers.push(this.CurrentAnswer)
      this.$refs.poll.addAnswer(this.CurrentAnswer)
      this.CurrentAnswer = '' // clear answer input box
    },
    removeAnswer (answer) {
      this.Answers = this.Answers.filter(e => e !== answer)
      this.$refs.poll.removeAnswer(answer)
    },
    createPoll () {
      // submit poll to KOA server
    }
  }
}
</script>

<style lang="scss" scoped>
  .answer {
    padding-left: 1em;
    font-size: 20px;
  }
  .answer:hover {
    text-decoration: line-through;
    font-weight: bold;
    color: red;
  }
</style>
