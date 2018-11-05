<template>
  <div id="personalInfoForm">
    <form>
      <div class="field">
        <label class="label">First Name</label>
        <div class="control">
          <input
            v-model="first_name"
            class="input"
            type="text"
            placeholder="First Name">
        </div>
      </div>

      <div class="field">
        <label class="label">Last Name</label>
        <div class="control">
          <input
            v-model="last_name"
            class="input"
            type="text"
            placeholder="Last Name">
        </div>
      </div>

      <div class="field">
        <label class="label">RIN</label>
        <div class="control">
          <input
            v-model="rin"
            class="input"
            type="text"
            placeholder="RIN">
        </div>
      </div>

      <button @click="save">Save</button>
    </form>
  </div>
</template>

<script>
import API from '../../api';

export default {
  name: 'PersonalInfoForm',
  data () {
    return {
      first_name: '',
      last_name: '',
      rin: this.$store.state.auth.user.rin,
      grad_year: this.$store.state.auth.user.grad_year
    };
  },
  computed: {
    user () { return this.$store.state.auth.user; }
  },
  methods: {
    async save () {
      const updatedUser = await API.post('/setup/personalinfo', {
        first_name: this.first_name,
        last_name: this.last_name,
        rin: this.rin,
        grad_year: this.grad_year
      });
    }
  }
};
</script>

<style lang="scss" scoped>
</style>
