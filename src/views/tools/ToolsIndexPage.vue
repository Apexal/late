<!--Tools: Main listing page-->
<template>
  <section class="section tools-page">
    <h1 class="title has-text-centered-mobile">
      Tools
    </h1>
    <h2
      class="subtitle has-text-centered-mobile"
      style="padding-left: 5px;"
    >
      Student tools to help you stay productive and informed
    </h2>

    <div class="tile is-ancestor">
      <div class="tile">
        <div class="tile is-parent is-vertical">
          <router-link
            tag="article"
            :to="{name: 'checklist'}"
            class="tile is-child tools-button notification"
          >
            <i class="fas fa-tasks" />
            <p class="title">
              Checklist
            </p>
            <p class="subtitle">
              Create a checklist for all the items you need to move into your
              dorm
            </p>
          </router-link>
          <router-link
            tag="article"
            :to="{name: 'study-tools'}"
            class="tile is-child tools-button notification"
          >
            <i class="fas fa-hourglass-half" />
            <p class="title">
              Study Timer
            </p>
            <p class="subtitle">
              Work/study with the Pomodoro timer to keep you focused and
              motivated
            </p>
          </router-link>
          <router-link
            tag="article"
            :to="{name: 'dorm-photos'}"
            class="tile is-child tools-button notification"
          >
            <i class="fas fa-home" />
            <p class="title">
              Dorm Photos
            </p>
            <p class="subtitle">
              View or contribute to photos of RPI student housing
            </p>
          </router-link>
        </div>
        <div class="tile is-parent is-vertical">
          <router-link
            tag="article"
            :to="{name: 'quick-links'}"
            class="tile is-child tools-button notification"
          >
            <i class="fas fa-link" />
            <p class="title">
              Quick Links
            </p>
            <p class="subtitle">
              Student curated list of useful
              <b>RPI</b> related links
            </p>
          </router-link>
          <router-link
            tag="article"
            :to="{name: 'gpa-calculator'}"
            class="tile is-child tools-button notification"
          >
            <i class="fas fa-calculator" />
            <p class="title">
              Grade Calculators
            </p>
            <p class="subtitle">
              Calculate your GPA and estimate your course grades
            </p>
          </router-link>
        </div>
      </div>
    </div>
    <h2 class="subtitle is-size-4 has-text-grey-lighter has-text-centered">
      More to come!
    </h2>
    <hr v-if="loggedIn">
    <form
      v-if="loggedIn"
      class="suggest"
      @submit.prevent="suggestTool"
    >
      <b-field>
        <b-input
          id="suggest-tools"
          v-model.trim="suggestion"
          class="is-fullwidth"
          placeholder="Suggest a new tool - get credit if it is implemented!"
          required
        />

        <p class="control">
          <button class="button is-primary">
            Suggest
          </button>
        </p>
      </b-field>
    </form>
  </section>
</template>

<script>
export default {
  name: 'ToolsPage',
  data () {
    return {
      suggestion: ''
    }
  },
  methods: {
    async suggestTool () {
      try {
        await this.$http.post('/tools/suggest', {
          suggestion: this.suggestion
        })
      } catch (e) {
        return
      }
      this.$buefy.toast.open({
        type: 'is-primary',
        message: 'Suggestion sent to Frank! Thank you for your idea!'
      })
      this.suggestion = ''
    }
  }
}
</script>

<style lang="scss" scoped>
.tools-button i {
  position: absolute;
  right: 30px;
  font-size: 3.5em;
  opacity: 0.1;
  color: rgba(0, 0, 0, 0.4);
}

.tools-button {
  background: none;
  border: 1px solid rgba(224, 224, 224, 0.8);
  border-radius: 5px;
  color: black;
  display: block;
  font-size: 1.6em;
  font-weight: bold;
  position: relative;
  cursor: pointer;
  max-width: 650px;
}

.tools-button,
.tools-button::after,
.tools-button i {
  transition: all 0.1s;
}

.tools-button:hover {
  color: white;
  background: #2e3b59;
}

.tools-button:hover i {
  color: rgba(255, 255, 255, 0.6);
  opacity: 0.3;
}

.help {
  display: none !important;
  width: 0px !important;
}
</style>
