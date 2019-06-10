<template>
  <div class="sidebar-chat">
    <ul
      ref="messages"
      class="sidebar-body messages"
    >
      <li class="chat-message notice">
        <i class="fas fa-smile-beam notice-icon" />
        <div class="panel-block has-text-grey no-hover">
          Please be courteous and helpful to your fellow students.
        </div>
      </li>
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
      class="panel-block send-message"
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
export default {
  name: 'Chat',
  data () {
    return {
      messages: [],
      newMessage: '',
      onlineCount: 0
    };
  },
  created () {
    this.$socket.emit('get messages');
    this.$socket.on('messages', messages => {
      this.messages = messages;
      this.$nextTick(() => {
        this.$refs.messages.scrollTop = this.$refs.messages.scrollHeight;
      });
    });

    this.$socket.on('online count', onlineCount => {
      this.onlineCount = onlineCount;
    });
  },
  methods: {
    sendMessage () {
      this.$socket.emit('message', {
        author: this.user.first_name,
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

  .field input {
    border-radius: 5px 0px 0px 4px !important;
  }

  .notice {
    i {
      width: 100%;
      text-align: center;
      font-size: 4em;
      padding: 15px 0px 5px 0px;
      display: block;
      color: rgba(128, 128, 128, 0.5);
      border-style: none;
    }

    div {
      display: block;
      width: 100%;
      text-align: center;
      border-style: none;
    }
  }
}
</style>
