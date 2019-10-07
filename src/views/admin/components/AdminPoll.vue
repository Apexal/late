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
                class="button"
                @click="createPoll"
              >
                Submit Poll
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
      CurrentAnswer: '',
      Answers: []
    }
  },
  methods: {
    addAnswer () {
      this.Answers.push(this.CurrentAnswer)
      this.CurrentAnswer = '' // clear answer input box
    },
    removeAnswer (answer) {
      this.Answers = this.Answers.filter(e => e !== answer)
    },
    createPoll () {

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
