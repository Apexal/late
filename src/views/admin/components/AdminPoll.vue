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
                v-model="options.question"
                style="margin-bottom: 10px"
                placeholder="Question"
                type="text"
                class=""
              />
              <b-field grouped>
                <b-input
                  v-model="options.currentAnswer"
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
                    v-for="answer in options.answers"
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
              <b-field
                v-if="options.question && options.answers.length > 0"
              >
                <b-datepicker
                  v-model="options.endDate"
                  placeholder="Type or select a date..."
                  editable
                />
                <b-timepicker
                  v-model="options.endDate"
                  placeholder="Type or select a time..."
                  hour-format="12"
                />
                <button
                  class="button"
                  @click="createPoll"
                >
                  Submit Poll
                </button>
              </b-field>
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
      options: {
        question: '',
        currentAnswer: '',
        answers: [],
        endDate: new Date()
      },
      currentID: 0
    }
  },
  watch: {
    'options.question': function (val, oldVal) {
      this.$refs.poll.changeTitle(val)
    }
  },
  methods: {
    addAnswer () {
      if (!this.options.currentAnswer) return // do nothing if input is empty
      let answer = { value: this.currentID++, text: this.options.currentAnswer, votes: 0 }

      this.options.answers.push(answer)
      this.$refs.poll.addAnswer(answer) // send answer data to Poll child component

      this.options.currentAnswer = '' // clear answer input box
    },
    removeAnswer (answer) {
      this.options.answers = this.options.answers.filter(e => e !== answer)
      this.$refs.poll.removeAnswer(answer)
    },
    createPoll () {
      // submit poll to KOA server
      this.$http.post('/api/polls', this.options)
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
  .datepicker.control {
    padding-right: 10px;
  }
  .timepicker.control {
    padding-right: 10px;
  }
</style>
