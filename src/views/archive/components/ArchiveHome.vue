<template>
  <div class="archive-home">
    <div class="columns is-multiline term-select">
      <div
        v-for="(term, index) in userTerms"
        :key="index"
        class="column is-half"
      >
        <router-link
          class="box term"
          :to="{name: 'archive-term', params: {termCode: term.code}}"
        >
          <span class="is-pulled-right has-text-grey">started on {{ shortDateFormat(term.startDate) }}</span>
          <h2>{{ term.name }}</h2>
        </router-link>
      </div>
    </div>
    <p
      v-if="userTerms.length === 0"
      class="has-text-grey has-text-centered"
    >
      You have no history yet! Once you finish a semester it will show up here.
    </p>
  </div>
</template>

<script>
import moment from 'moment'

export default {
  name: 'ArchiveHome',
  computed: {
    userTerms () {
      return this.$store.state.schedule.terms.filter(
        term =>
          this.$store.state.auth.user.terms.includes(term.code) &&
          term.code !== this.currentTerm.code &&
          moment(term.startDate).isBefore(this.rightNow)
      )
    }
  }
}
</script>

<style lang="scss" scoped>
.term {
  cursor: pointer;
}
</style>
