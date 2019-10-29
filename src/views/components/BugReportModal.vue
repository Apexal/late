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
          Report a Bug
        </p>
      </header>
      <section class="modal-card-body">
        <form>
          <b-field label="Title">
            <b-input
              v-model="title"
              type="text"
              name="title"
              required
            />
          </b-field>

          <b-field label="Description">
            <textarea
              id="description"
              v-model="description"
              name="description"
              style="width:600px; height:200px;"
              class="textarea"
              placeholder="Give a description of the bug you encountered."
              required
            />
          </b-field>
        </form>
      </section>
      <footer class="modal-card-foot">
        <button
          class="button is-success"
          data-dismiss="modal"
          @click="submit()"
        >
          Submit
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
    open: { type: Boolean, default: false }
  },
  data () {
    return {
      title: '',
      description: ''
    }
  },
  methods: {
    async submit () {
      if (!this.title.length || !this.description.length) return

      let request
      try {
        request = await this.$http.post('/integrations/githubissue', { title: this.title, description: this.description })
        this.$emit('close-modal')
      } catch (e) {
        this.$buefy.toast.open({
          message: e.message,
          type: 'is-danger'
        })
      }

      this.$buefy.toast.open({
        message: 'Thanks for submitting! It has been sent straight to the GitHub repo.',
        type: 'is-success'
      })

      this.title = ''
      this.description = ''
    }
  }

}

</script>

<style>

</style>

<!--    -->
