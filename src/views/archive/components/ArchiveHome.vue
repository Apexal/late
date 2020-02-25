<template>
  <div class="archive-home">
    <div class="columns is-multiline term-select">
      <div
        v-for="(term, index) in terms"
        :key="index"
        class="column is-half"
      >
        <router-link
          class="box term"
          :class="hasTerm(term) ? '' : 'has-text-grey'"
          :to="{name: 'archive-term', params: {termCode: term.code}}"
        >
          <h2>{{ term.name }}</h2>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'ArchiveHome',
  computed: {
    terms () {
      return this.$store.state.schedule.terms.filter(
        term =>
          term.code !== this.currentTerm.code &&
          moment(term.startDate).isBefore(this.rightNow)
      )
    }
  },
  methods: {
    hasTerm (term) {
      return this.$store.state.auth.user.terms.includes(term.code)
    }
  }
}
</script>

<style lang="scss" scoped>
.term {
  cursor: pointer;
}
</style>
