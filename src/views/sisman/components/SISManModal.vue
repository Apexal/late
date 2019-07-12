<template>
  <b-modal
    has-modal-card
    class="sis-man-modal"
    :active="open"
    :can-cancel="false"
  >
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">
          Getting Started
        </p>
      </header>
      <section class="modal-card-body">
        <img
          class="is-pulled-right sis-man is-hidden-touch"
          src="@/assets/img/sisman.svg"
          alt="SIS Man"
        >
        <p>
          Welcome to <b>LATE</b>! To get started, we need to know a bit about you, most importantly your <i>course schedule</i>.
          You can go through the setup process <b>manually</b> or you can <b>import from SIS</b> to
          get your name, major, the terms you are in school, and your courses.
        </p>
        <br>
        <p>After that, you can give optional info like <i>your weekly study/work unavailability, your phone number, your Discord account, and your Google Calendar.</i></p>
      </section>
      <footer class="modal-card-foot">
        <b-button
          type="is-primary"
          @click="$emit('close-modal'); $emit('sis-import')"
        >
          Import Everything from SIS
        </b-button>
        <b-button
          @click="$emit('close-modal'); $emit('manual')"
        >
          Manual
        </b-button>
      </footer>
    </div>
  </b-modal>
</template>

<script>
export default {
  name: 'SISManModal',
  props: {
    open: {
      type: Boolean,
      default: false
    }
  }
};
</script>

<style lang="scss" scoped>
.sis-man {
  width: 30%;
  min-width: 100px;
}
</style>
