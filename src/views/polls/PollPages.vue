/*
This VueJS component can be inserted into any
page, and will automatically retrieve any existing
polls from MongoDB and display them on separate pages
*/

<template>
  <div>
    <div
      v-if="length === 0"
      style="font-size: 1.5em; padding-top: 1em; text-align: center;"
    >
      No current polls at the moment
    </div>
    <div v-if="length > 0">
      <ul>
        <li
          v-for="(poll, index) in list"
          :key="poll.UID"
        >
          <Poll
            v-if="index === current - 1"
            :options="list[current-1]"
          />
        </li>
      </ul>
      <b-field grouped>
        <div
          v-if="user.admin"
          style="margin-right: 1em;"
        >
          <b-button
            type="is-danger"
            title="Delete this poll"
            icon-left="trash"
            @click="adminDelete"
          />
        </div>
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
      </b-field>
    </div>
  </div>
</template>

<script>

import Poll from '@/views/polls/Poll'

export default {
  name: 'Polls',
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
    this.updatePolls()
  },
  methods: {
    async updatePolls () {
      try {
        await this.$store.dispatch('GET_POLLS', 'false')
      } catch (e) {
        console.error(e)
      }
      this.list = this.$store.state.polls.polls
      this.length = this.list.length
    },
    adminDelete () {
      try {
        this.$http.delete('/polls?UID=' + this.list[this.current - 1].UID)
      } catch (e) {
        console.error(e)
      }
      this.updatePolls()
    }
  }
}
</script>

<style lang="scss">
</style>
