<!--Admin: Log module-->
<template>
  <div class="admin-fun">
    <h2 class="subtitle">
      Admin Fun
    </h2>

    <div class="columns">
      <div class="column is-half">
        <div class="panel">
          <p class="panel-heading">
            SIS Man Whisper
          </p>
          <div
            v-for="rcsID in online"
            :key="rcsID"
            class="panel-block"
            :class="{'is-active': selectedRCSID === rcsID}"
            @click="selectedRCSID = rcsID"
          >
            {{ rcsID }}
          </div>
          <div class="panel-block">
            <p class="control">
              <input
                v-model="SISManMessage"
                class="input"
                type="text"
              >
            </p>
            <button
              class="button"
              @click="sendSISManMessage"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminFun',
  data () {
    return {
      SISManMessage: '',
      selectedRCSID: ''
    }
  },
  computed: {
    online () {
      return this.$store.state.socketio.onlineUsers
    }
  },
  methods: {
    sendSISManMessage () {
      if (this.SISManMessage.length > 0) {
        this.$socket.client.emit('send sis man message', this.selectedRCSID, this.SISManMessage)
      }
      this.SISManMessage = ''
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
