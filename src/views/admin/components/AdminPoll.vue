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
                <div class="endDate">
                  End Date:
                </div>
                <b-datepicker
                  v-model="endDate"
                  placeholder="Type or select a date..."
                  icon="calendar"
                  editable
                />
                <b-timepicker
                  v-model="endDate"
                  placeholder="Type or select a time..."
                  icon="clock"
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
          :options.sync="options"
        />
      </div>
    </div>
    <div style="float: left; width: 50%;">
      <AdminPollViewer ref="adminViewer" />
    </div>
  </div>
</template>

<script>

import Poll from '@/views/polls/Poll'
import AdminPollViewer from '@/views/polls/AdminPollViewer'

export default {
  name: 'AdminFun',
  components: {
    Poll,
    AdminPollViewer
  },
  data () {
    return {
      options: {
        question: '',
        answers: [],
        showResults: false
      },
      currentAnswer: '',
      currentID: 0,
      endDate: new Date()
    }
  },
  methods: {
    addAnswer () {
      if (!this.currentAnswer) return // do nothing if input is empty
      const answer = { value: this.currentID++, text: this.currentAnswer, votes: 0 }

      this.options.answers.push(answer)

      this.currentAnswer = '' // clear answer input box
    },
    removeAnswer (answer) {
      this.options.answers = this.options.answers.filter(e => e.text !== answer.text)
    },
    async createPoll () {
      if (this.endDate <= new Date()) {
        this.$buefy.toast.open({
          duration: 3000,
          message: 'Invalid expiration date!',
          position: 'is-top',
          type: 'is-danger'
        })
        return
      }

      // submit poll to KOA server
      let request
      try {
        request = await this.$http.put('/polls', { options: this.options, endDate: this.endDate })
      } catch (e) {
        console.error(e)
      }

      // updates the AdminPollViewer component by ref
      this.$refs.adminViewer.getPolls()
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
    padding-right: 2.65%;
  }
  .endDate {
    vertical-align: middle;
    font-size: 1.1em;
    padding-right: 0.7em;
    font-weight: bold;
    white-space: nowrap;
  }
</style>
