<template>
  <div class="sidebar-chat">
    <ul
      ref="messages"
      class="sidebar-body messages"
    >
      <li
        v-for="(message, index) in messages"
        :key="index"
        class="chat-message"
        :title="shortDateTimeFormat(message.sentAt)"
      >
        <span class="message-author">{{ message.author }}</span>
        <span class="message-text">{{ message.text }}</span>
      </li>
    </ul>
    <form
      class="panel-block"
      @submit.prevent="sendMessage"
    >
      <b-field class="is-fullwidth">
        <input
          v-model="newMessage"
          class="input"
          type="text"
          placeholder="Send message"
          required
        >
        <p class="control">
          <button
            class="button is-primary"
            type="submit"
          >
            Send
          </button>
        </p>
      </b-field>
    </form>
  </div>
</template>

<script>
import io from 'socket.io-client';

export default {
  name: 'Chat',
  data () {
    return {
      messages: [],
      newMessage: '',
      onlineCount: 0,
      socket: io('localhost:3000')
    };
  },
  created () {
    this.socket.on('messages', messages => {
      this.messages = messages;
      this.$nextTick(() => {
        this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight;
      });
    });

    this.socket.on('online count', onlineCount => {
      this.onlineCount = onlineCount;
    });
  },
  methods: {
    sendMessage () {
      this.socket.emit('message', {
        author: this.user.rcs_id,
        text: this.newMessage
      });
      this.newMessage = '';
    }
  }
};
</script>

<style lang="scss" scoped>
.sidebar-chat {
  .messages {
    padding: 5px;
    border: 1px solid #dbdbdb;

    height: 200px;
    overflow: auto;

    .chat-message {
      .message-author {
        cursor: pointer;
        font-weight: bold;
        margin-right: 5px;
      }
    }
  }
}
</style>
