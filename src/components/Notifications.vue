<template>
  <div
    v-show="notifications.length > 0"
    class="notifications"
  >
    <div
      v-for="(n, index) in notifications"
      :key="index"
      :class="'is-' + n.type"
      class="notification"
    ><button
      class="delete"
      @click="remove(n)"
    />{{ n.description }}</div>
  </div>
</template>

<script>
export default {
  name: 'Notifications',
  data () {
    return {};
  },
  computed: {
    notifications () {
      return this.$store.state.notifications.list;
    }
  },
  methods: {
    remove (n) {
      this.$store.commit('REMOVE_NOTIFICATION', n);
    }
  }
};
</script>

<style lang="scss" scoped>
.notifications {
  padding: 30px 20px 0px 20px;
}
</style>
