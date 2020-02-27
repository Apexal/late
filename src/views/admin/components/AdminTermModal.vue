<template>
  <b-modal
    :active="open"
    has-modal-card
    @close="$emit('close-modal')"
  >
    <div
      class="modal-card"
      style="width: auto"
    >
      <header class="modal-card-head">
        <p class="modal-card-title">
          Edit Term <b>{{ term.name }}</b>
        </p>
      </header>
      <section class="modal-card-body">
        <form
          id="update-term-form"
          @submit.prevent="updateTerm"
        >
          <b-field label="Code">
            <b-input
              v-model="editedTerm.code"
              placeholder="e.g. 201908"
              type="text"
              required
            />
          </b-field>
          <b-field label="Name">
            <b-input
              v-model="editedTerm.name"
              type="text"
              name="term-name"
              :placeholder="term.name"
              required
            />
          </b-field>
          <b-field label="Start Date">
            <b-input
              v-model="formattedStart"
              type="date"
              name="term-start-date"
              required
            />
          </b-field>
          <b-field label="End Date">
            <b-input
              v-model="formattedEnd"
              type="date"
              name="term-end-date"
              required
            />
          </b-field>
        </form>
      </section>
      <footer class="modal-card-foot">
        <button
          class="button"
          type="button"
          @click="$emit('close-modal')"
        >
          Close
        </button>
        <button
          class="button is-primary"
          type="submit"
          form="update-term-form"
        >
          Save
        </button>
      </footer>
    </div>
  </b-modal>
</template>

<script>
import moment from 'moment'

export default {
  name: 'AdminTermModal',
  props: {
    open: {
      type: Boolean,
      default: false
    },
    term: {
      type: Object,
      required: true
    }
  },
  data () {
    return {
      editedTerm: {
        code: '',
        name: '',
        start: null,
        end: null,
        classesEnd: null
      }
    }
  },
  computed: {
    formattedStart: {
      get () {
        return moment(this.editedTerm.start).format('YYYY-MM-DD')
      },
      set (newDateStr) {
        this.editedTerm.start = moment(newDateStr, 'YYYY-MM-DD').toDate()
      }
    },
    formattedEnd: {
      get () {
        return moment(this.editedTerm.end).format('YYYY-MM-DD')
      },
      set (newDateStr) {
        this.editedTerm.end = moment(newDateStr, 'YYYY-MM-DD').toDate()
      }
    }
  },
  watch: {
    term (newTerm) {
      this.editedTerm = Object.assign({}, newTerm)
    }
  },
  methods: {
    async updateTerm () {
      // Make request
      this.$store.dispatch('UPDATE_TERM', { termID: this.term._id, updatedTerm: this.editedTerm })
      this.$buefy.toast.open({
        type: 'is-success',
        message: 'Successfully updated term.'
      })
    }
  }
}
</script>

<style lang="scss" scoped>

</style>
