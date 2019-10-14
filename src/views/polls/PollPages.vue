/*
Takes a list of polls (from koa request) and parses
into a pagination UI
*/

<template>
  <div>
    <Poll
      :options="list[current-1].options"
    />
    <b-pagination
      :total="total"
      :current.sync="current"
      range-before="2"
      range-after="2"
      order=""
      simple="true"
      rounded="false"
      per-page="1"
      icon-prev="chevron-left"
      icon-next="chevron-right"
      aria-next-label="Next page"
      aria-previous-label="Previous page"
      aria-page-label="Page"
      aria-current-label="Current page"
    />
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
      current: 1,
      list: Array,
      total: { type: Number, default: 0 }
    }
  },
  async mounted () {
    let request
    try {
      request = await this.$http.get('/polls')
    } catch (e) {
      console.error(e)
    }
    this.list = request.data.polls
    this.total = this.list.length
    if (this.list[this.current - 1].options.voted['lanea3'] !== undefined) {
      this.list[this.current - 1].options.showResults = true
    }
  }
}
</script>

<style lang="scss">
</style>
