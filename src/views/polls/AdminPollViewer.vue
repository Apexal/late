<template>
  <div v-if="length > 0">
    <div class="buttons">
      <b-button
        type="is-danger"
        icon-left="trash"
        @click="deleteConfirm=true"
      >
        Delete expired polls
      </b-button>
      <div v-if="deleteConfirm">
        <b-field grouped>
          <div style="font-size: 1.5em; padding-right: 0.5em;">
            Are you sure?
          </div>
          <b-button
            type="is-danger"
            title="There's no going back"
            @click="deleteAllPolls"
          >
            Yes
          </b-button>
          <b-button
            type="is-success"
            @click="deleteConfirm=false"
          >
            No
          </b-button>
        </b-field>
      </div>
    </div>
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
      current: 1,
      deleteConfirm: false
    }
  },
  async mounted () {
    this.getPolls()
  },
  methods: {
    // send request to get polls (flag = getAll = true)
    async getPolls () {
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
    },
    async deleteAllPolls () {
      this.deleteConfirm = false
      let request
      try {
        request = await this.$http.delete('/polls')
      } catch (e) {
        console.error(e)
      }
      // update polls list to refresh render
      this.getPolls()

      var deletedAmount = 'Deleted ' + String(request.data) + ' polls(s)'
      this.$buefy.toast.open({
        duration: 3000,
        message: deletedAmount,
        position: 'is-top',
        type: 'is-success'
      })
    }
  }
}
</script>

<style>

</style>
