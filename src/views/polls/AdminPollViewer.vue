<template>
  <div v-if="length > 0">
    <b-pagination
      :total.sync="length"
      :current.sync="current"
      range-before="3"
      range-after="3"
      order=""
      per-page="1"
      icon-prev="chevron-left"
      icon-next="chevron-right"
      aria-next-label="Next page"
      aria-previous-label="Previous page"
      aria-page-label="Page"
      aria-current-label="Current page"
    />
    <ul>
      <li
        v-for="(poll, index) in polls"
        :key="poll.UID"
      >
        <Poll
          v-if="index === current - 1"
          :options="polls[current-1]"
        />
      </li>
    </ul>
  </div>
</template>

<script>

import Poll from '@/views/polls/Poll'

export default {
  components: {
    Poll
  },
  data () {
    return {
      polls: Array,
      length: 0,
      current: 1
    }
  },
  async mounted () {
    let request
    try {
      request = await this.$http.get('/polls?getAll=true')
    } catch (e) {
      console.error(e)
    }
    this.polls = request.data.polls
    this.length = this.polls.length
    this.polls.forEach(function (poll) {
      poll.showResults = true
    })
  }
}
</script>

<style>

</style>
