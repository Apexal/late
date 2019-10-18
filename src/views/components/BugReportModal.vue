<template>
  <b-modal
    has-modal-card
    class="bug-report-modal"
    :active="open"
    @close="$emit('close-modal')"
  >
    <!-- div class copied from the Buefy docs to make the modal look nice. Modal contents copied in the middle where designated in the docs. -->
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">
          Report a bug
        </p>
      </header>
      <section class="modal-card-body">
        <form>
          Enter a title for this bug report. <br>
          <input
            v-model="title"
            type="text"
            name="title"
            class="input"
          > <br><br>
          Describe the bug in as much detail as possible.<br>
          <textarea
            id="description"
            v-model="description"
            name="description"
            style="width:600px; height:200px;"
            class="textarea"
          />
        </form>
      </section>
      <footer class="modal-card-foot">
        <button
          class="button is-success"
          @click="submit()"
        >
          Submit bug report
        </button>
        <button
          class="button"
          data-dismiss="modal"
          @click="$emit('close-modal')"
        >
          Cancel
        </button>
      </footer>
    </div>
  </b-modal>
</template>

<script>
export default {
  name: 'BugReportModal',
  props: {
    open: Boolean
  },
  data () {
    return {
      'title': 'Bug report',
      'description': 'Bug report description'
    }
  },
  methods: {
    async submit () {
      try {
        let request
        request = await this.$route.post('/githubissue', {
          params: { title: this.title, description: this.description }
        })
      } catch (e) {
        this.$buefy.toast.open({
          message: e.response,
          type: 'is-danger'
        })
      }
    }
  }

}

</script>

<style>

</style>

<!--    -->
