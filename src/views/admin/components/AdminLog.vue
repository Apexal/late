<!--Admin: Log module-->
<template>
  <div class="admin-log content">
    <b-loading
      :is-full-page="false"
      :active="loading"
      :can-cancel="false"
    />

    <h2 class="subtitle">
      Server Log
    </h2>
    <b-button
      class="is-pulled-right"
      :loading="loading"
      @click="getLog"
    >
      Refresh
    </b-button>
    <blockquote>
      <ul>
        <li
          v-for="(line, index) in log"
          :key="index"
        >
          {{ line }}
        </li>
      </ul>
    </blockquote>
  </div>
</template>

<script>
export default {
  name: 'AdminLog',
  data () {
    return {
      log: [],
      loading: true
    }
  },
  async created () {
    await this.getLog()
  },
  methods: {
    async getLog () {
      this.loading = true
      let request
      try {
        request = await this.$http.get('/students/log')
      } catch (e) {
        this.showError(e.response.data.message)
        this.log = []
        this.loading = false
        return
      }

      this.log = request.data.log.reverse().filter(line => line.trim()) // flip and remove empty lines
      this.loading = false
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
