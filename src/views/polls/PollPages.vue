/*
Takes a list of polls (from koa request) and parses
into a pagination UI
*/

<template>
  <div v-if="list.length > 0">
    <ul>
      <li
        v-for="(poll, index) in list"
        :key="poll.question"
      >
        <Poll
          v-if="index === current - 1"
          :id="current-1"
          :options="list[current-1]"
        />
      </li>
    </ul>
    <b-pagination
      :total.sync="length"
      :current.sync="current"
      :simple="isSimple"
      range-before="1"
      range-after="1"
      order=""
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
      length: 0,
      current: 1,
      list: Array,
      isSimple: true
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
    this.length = this.list.length
  }
}
</script>

<style lang="scss">
</style>
