<template>
  <div class="account-setup-terms">
    <h2 class="is-size-4 integration-note">
      When will you be at <b>RPI</b>?
    </h2>

    <div class="terms columns is-multiline">
      <div
        v-for="term in terms"
        :key="term.code"
        class="column is-one-third"
        @click="toggleTerm(term.code)"
      >
        <div
          class="box term is-unselectable"
          :class="{ 'has-background-primary': selected.includes(term.code) }"
        >
          <b>{{ term.name }}</b>
          <span
            v-if="selected.includes(term.code)"
            class="icon is-pulled-right"
          >
            <i class="fa fa-check" />
          </span>
        </div>
      </div>
    </div>

    <hr>

    <b-button
      type="is-primary"
      :disabled="saved"
    >
      Save and Continue
    </b-button>
  </div>
</template>

<script>
export default {
  name: 'AccountSetupTerms',
  data () {
    return {
      selected: []
    };
  },
  computed: {
    currentSelections () {
      return this.$store.state.auth.user.terms;
    },
    saved () {
      return JSON.stringify(this.currentSelections) === JSON.stringify(this.selected);
    },
    terms () {
      return this.$store.state.schedule.terms;
    }
  },
  created () {
    this.selected = this.currentSelections.slice(0);
  },
  methods: {
    toggleTerm (termCode) {
      if (this.selected.includes(termCode)) {
        this.selected.splice(this.selected.indexOf(termCode), 1);
      } else {
        this.selected.push(termCode);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.term {
  cursor: pointer;
}
</style>
