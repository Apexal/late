/*
Takes a list of polls (from koa request) and parses
into a pagination UI
*/

<template>
  <div>
    <Poll :options="pollList[current-1]" />
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
  props: {
    // eslint-disable-next-line vue/require-default-prop
    pollList: Array
  },
  data () {
    return {
      current: 1
    }
  }
}
</script>

<style lang="scss">
</style>
