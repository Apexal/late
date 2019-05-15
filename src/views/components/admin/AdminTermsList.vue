<template>
  <div class="admin-terms-list">
    <h2 class="subtitle">
      School Terms
    </h2>

    <table class="table is-fullwidth is-striped terms">
      <thead>
        <tr>
          <th>Code</th>
          <th>Name</th>
          <th>Start</th>
          <th>End of Classes</th>
          <th>End</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="term in terms"
          :key="term.code"
          class="term"
          :class="{ 'is-selected': currentTerm.code === term.code }"
        >
          <td><code>{{ term.code }}</code></td>
          <td><b>{{ term.name }}</b></td>
          <td :title="fromNow(term.start)">
            {{ longDateFormat(term.start) }}
          </td>
          <td :title="fromNow(term.classesEnd)">
            {{ longDateFormat(term.classesEnd) }}
          </td>
          <td :title="fromNow(term.end)">
            {{ longDateFormat(term.end) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'AdminTermsList',
  computed: {
    terms () {
      return this.$store.state.schedule.terms;
    },
    currentTerm () {
      return this.$store.getters.currentTerm;
    }
  }
};
</script>

<style lang="scss" scoped>

</style>
