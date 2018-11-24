<template>
  <div class="email-setup box">
    <h2 class="subtitle">Email Notifications</h2>

    <form @submit.prevent="save">
      <div class="field">
        <input
          id="enabled"
          v-model="enabled"
          type="checkbox"
          class="switch"
        >
        <label for="enabled">Enable weekly email reports</label>
      </div>
    </form>
  </div>
</template>

<script>
import 'bulma-switch';

export default {
  name: 'EmailSetup',
  data () {
    return {
      enabled: false
    };
  },
  methods: {
    async save () {

    }
  }
};
</script>

<style lang="scss" scoped>
</style>
