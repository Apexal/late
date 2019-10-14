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
                  v-model="currentAnswer"
                  placeholder="Answer"
                  type="text"
                  expanded
                  @keyup.enter.native="addAnswer"
                />
                <b-button
                  class="button"
                  @click="addAnswer"
                >
                  Add Answer
                </b-button>
              </b-field>
              <b-field class="answer_list">
                <ul>
                  <template
                    v-for="answer in options.answers"
                  >
                    <li
                      :key="answer.text"
                      class="answer"
                      @click="removeAnswer(answer)"
                    >
                      • {{ answer.text }}
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
                <b-button
                  class="button"
                  type="is-primary"
                  @click="createPoll"
                >
                  Submit Poll
                </b-button>
              </b-field>
            </p>
          </div>
        </div>
      </div>
      <div class="column is-half">
        <Poll
          ref="poll"
          :options.sync="options"
        />
      </div>
    </div>
    <div class="buttons">
      <b-button
        type="is-danger"
        icon-right="trash"
        @click="deleteAllPolls"
      >
        Delete all polls
      </b-button>
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
        answers: [],
        endDate: new Date(),
        showResults: false
      },
      currentAnswer: '',
      currentID: 0
    }
  },
  methods: {
    addAnswer () {
      if (!this.currentAnswer) return // do nothing if input is empty
      let answer = { value: this.currentID++, text: this.currentAnswer, votes: 0 }

      this.options.answers.push(answer)

      this.currentAnswer = '' // clear answer input box
    },
    removeAnswer (answer) {
      this.options.answers = this.options.answers.filter(e => e.text !== answer.text)
    },
    async createPoll () {
      // submit poll to KOA server
      let request
      try {
        request = await this.$http.post('/polls', this.options)
      } catch (e) {
        console.error(e)
      }
    },
    async deleteAllPolls () {
      let request
      try {
        request = await this.$http.delete('/polls')
      } catch (e) {
        console.error(e)
      }
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
