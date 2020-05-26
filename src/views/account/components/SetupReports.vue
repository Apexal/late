<!--Account: Notifications preferences module-->
<template>
  <div class="setup-reports">
    <div class="notification is-warning less-padding">
      <b>Work in Progress</b>
      In the future there will be further report customizations.
    </div>

    <div class="field">
      <b-switch
        :value="user.reportPreferences.enabled"
        @input="updateEnabled"
      >
        Receive weekly reports on Monday mornings?
      </b-switch>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SetupReports',
  data () {
    return {

    }
  },
  methods: {
    async updateEnabled (enabled) {
      let response
      try {
        response = await this.$http.patch('/students/user', {
          reportPreferences: {
            enabled
          }
        })
      } catch (e) {
        this.showError(e.reponse.data.message)
        return
      }

      this.$store.commit('SET_USER', response.data.updatedStudent)

      this.$buefy.toast.open({
        type: 'is-success',
        message: `Successfully ${enabled ? 'enabled' : 'disabled'} weekly reports!`
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.less-padding {
  padding: 1em;
}
</style>
